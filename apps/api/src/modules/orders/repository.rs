use sqlx::{PgPool, Row, postgres::PgRow};
use uuid::Uuid;

use crate::{error::ApiError, models::ids::UserId};

use super::model::{
    AssignDeliveryRequest, DeliveryAssignment, DeliveryStatus, Order, OrderItem, OrderStatus,
    PaymentProvider, PaymentStatus,
};

#[derive(Clone)]
pub struct OrderRepository {
    pool: PgPool,
}

impl OrderRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_from_cart(
        &self,
        user_id: UserId,
        address_id: Uuid,
        payment_provider: Option<PaymentProvider>,
    ) -> Result<Order, ApiError> {
        let mut transaction = self.pool.begin().await?;
        verify_address(&mut transaction, user_id.0, address_id).await?;
        let cart_id = cart_id(&mut transaction, user_id.0).await?;
        let cart_items = cart_items(&mut transaction, cart_id).await?;

        if cart_items.is_empty() {
            return Err(ApiError::Validation("cart is empty".to_string()));
        }

        for item in &cart_items {
            let updated = sqlx::query(
                r#"
                UPDATE books
                SET stock = stock - $2, updated_at = now()
                WHERE id = $1 AND stock >= $2
                "#,
            )
            .bind(item.book_id)
            .bind(item.quantity)
            .execute(&mut *transaction)
            .await?;

            if updated.rows_affected() == 0 {
                return Err(ApiError::Validation(format!(
                    "insufficient stock for {}",
                    item.title
                )));
            }
        }

        let subtotal: i32 = cart_items.iter().map(|item| item.line_total).sum();
        let shipping_fee = 0;
        let discount_total = 0;
        let total = subtotal + shipping_fee - discount_total;
        let provider = payment_provider.as_ref().map(PaymentProvider::as_str);
        let order_id: Uuid = sqlx::query(
            r#"
            INSERT INTO orders (
                user_id, address_id, status, payment_provider, payment_status,
                subtotal, shipping_fee, discount_total, total
            )
            VALUES ($1, $2, 'pending', $3, 'pending', $4, $5, $6, $7)
            RETURNING id
            "#,
        )
        .bind(user_id.0)
        .bind(address_id)
        .bind(provider)
        .bind(subtotal)
        .bind(shipping_fee)
        .bind(discount_total)
        .bind(total)
        .fetch_one(&mut *transaction)
        .await?
        .get("id");

        for item in &cart_items {
            sqlx::query(
                r#"
                INSERT INTO order_items (order_id, book_id, title, quantity, unit_price, line_total)
                VALUES ($1, $2, $3, $4, $5, $6)
                "#,
            )
            .bind(order_id)
            .bind(item.book_id)
            .bind(&item.title)
            .bind(item.quantity)
            .bind(item.unit_price)
            .bind(item.line_total)
            .execute(&mut *transaction)
            .await?;
        }

        insert_timeline(
            &mut transaction,
            order_id,
            OrderStatus::Pending.as_str(),
            None,
            Some(user_id.0),
        )
        .await?;

        sqlx::query("DELETE FROM cart_items WHERE cart_id = $1")
            .bind(cart_id)
            .execute(&mut *transaction)
            .await?;

        transaction.commit().await?;
        self.order_by_id(order_id).await?.ok_or(ApiError::NotFound)
    }

    pub async fn user_orders(&self, user_id: UserId) -> Result<Vec<Order>, ApiError> {
        let rows = sqlx::query(ORDER_SELECT_BY_USER)
            .bind(user_id.0)
            .fetch_all(&self.pool)
            .await?;
        rows_to_orders(&self.pool, rows).await
    }

    pub async fn user_order(&self, user_id: UserId, order_id: Uuid) -> Result<Order, ApiError> {
        let row = sqlx::query(ORDER_SELECT_BY_USER_AND_ID)
            .bind(user_id.0)
            .bind(order_id)
            .fetch_optional(&self.pool)
            .await?;
        row_to_order(&self.pool, row.ok_or(ApiError::NotFound)?).await
    }

    pub async fn admin_orders(
        &self,
        status: Option<OrderStatus>,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Order>, ApiError> {
        let rows = if let Some(status) = status {
            sqlx::query(ORDER_SELECT_BY_STATUS)
                .bind(status.as_str())
                .bind(limit)
                .bind(offset)
                .fetch_all(&self.pool)
                .await?
        } else {
            sqlx::query(ORDER_SELECT_ADMIN)
                .bind(limit)
                .bind(offset)
                .fetch_all(&self.pool)
                .await?
        };
        rows_to_orders(&self.pool, rows).await
    }

    pub async fn count_admin_orders(&self, status: Option<OrderStatus>) -> Result<i64, ApiError> {
        let row = if let Some(status) = status {
            sqlx::query("SELECT COUNT(*)::BIGINT AS total FROM orders WHERE status = $1")
                .bind(status.as_str())
                .fetch_one(&self.pool)
                .await?
        } else {
            sqlx::query("SELECT COUNT(*)::BIGINT AS total FROM orders")
                .fetch_one(&self.pool)
                .await?
        };

        Ok(row.get("total"))
    }

    pub async fn admin_order(&self, order_id: Uuid) -> Result<Order, ApiError> {
        self.order_by_id(order_id).await?.ok_or(ApiError::NotFound)
    }

    pub async fn update_status(
        &self,
        order_id: Uuid,
        status: OrderStatus,
        note: Option<&str>,
        actor: UserId,
    ) -> Result<Order, ApiError> {
        let result = sqlx::query("UPDATE orders SET status = $2, updated_at = now() WHERE id = $1")
            .bind(order_id)
            .bind(status.as_str())
            .execute(&self.pool)
            .await?;

        if result.rows_affected() == 0 {
            return Err(ApiError::NotFound);
        }

        let mut transaction = self.pool.begin().await?;
        insert_timeline(
            &mut transaction,
            order_id,
            status.as_str(),
            note,
            Some(actor.0),
        )
        .await?;
        transaction.commit().await?;

        self.admin_order(order_id).await
    }

    pub async fn assign_delivery(
        &self,
        order_id: Uuid,
        payload: &AssignDeliveryRequest,
        actor: UserId,
    ) -> Result<Order, ApiError> {
        let status = payload.status.clone().unwrap_or(DeliveryStatus::Assigned);
        let result = sqlx::query(
            r#"
            INSERT INTO delivery_assignments (order_id, agent_name, agent_phone, status, note, assigned_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (order_id)
            DO UPDATE SET agent_name = EXCLUDED.agent_name,
                          agent_phone = EXCLUDED.agent_phone,
                          status = EXCLUDED.status,
                          note = EXCLUDED.note,
                          assigned_by = EXCLUDED.assigned_by,
                          updated_at = now()
            "#,
        )
        .bind(order_id)
        .bind(payload.agent_name.trim())
        .bind(payload.agent_phone.trim())
        .bind(status.as_str())
        .bind(payload.note.as_deref())
        .bind(actor.0)
        .execute(&self.pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(ApiError::NotFound);
        }

        self.update_status(
            order_id,
            OrderStatus::OutForDelivery,
            Some("delivery assigned"),
            actor,
        )
        .await
    }

    pub async fn update_payment_state(
        &self,
        order_id: Uuid,
        provider: PaymentProvider,
        status: PaymentStatus,
        note: &str,
        actor: Option<UserId>,
    ) -> Result<Order, ApiError> {
        let result = sqlx::query(
            "UPDATE orders SET payment_provider = $2, payment_status = $3, updated_at = now() WHERE id = $1",
        )
        .bind(order_id)
        .bind(provider.as_str())
        .bind(status.as_str())
        .execute(&self.pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(ApiError::NotFound);
        }

        let mut transaction = self.pool.begin().await?;
        insert_timeline(
            &mut transaction,
            order_id,
            status.as_str(),
            Some(note),
            actor.map(|user_id| user_id.0),
        )
        .await?;
        transaction.commit().await?;

        self.admin_order(order_id).await
    }

    pub async fn append_timeline(
        &self,
        order_id: Uuid,
        status: &str,
        note: Option<&str>,
        actor: UserId,
    ) -> Result<Order, ApiError> {
        let mut transaction = self.pool.begin().await?;
        insert_timeline(&mut transaction, order_id, status, note, Some(actor.0)).await?;
        transaction.commit().await?;
        self.admin_order(order_id).await
    }

    async fn order_by_id(&self, order_id: Uuid) -> Result<Option<Order>, ApiError> {
        let row = sqlx::query(ORDER_SELECT_BY_ID)
            .bind(order_id)
            .fetch_optional(&self.pool)
            .await?;

        match row {
            Some(row) => Ok(Some(row_to_order(&self.pool, row).await?)),
            None => Ok(None),
        }
    }
}

async fn verify_address(
    transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    user_id: Uuid,
    address_id: Uuid,
) -> Result<(), ApiError> {
    let exists: bool = sqlx::query(
        "SELECT EXISTS(SELECT 1 FROM customer_addresses WHERE id = $1 AND user_id = $2) AS exists",
    )
    .bind(address_id)
    .bind(user_id)
    .fetch_one(&mut **transaction)
    .await?
    .get("exists");

    if !exists {
        return Err(ApiError::Validation(
            "address does not belong to user".to_string(),
        ));
    }

    Ok(())
}

async fn cart_id(
    transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    user_id: Uuid,
) -> Result<Uuid, ApiError> {
    let row = sqlx::query("SELECT id FROM carts WHERE user_id = $1")
        .bind(user_id)
        .fetch_optional(&mut **transaction)
        .await?;

    row.map(|row| row.get("id"))
        .ok_or_else(|| ApiError::Validation("cart is empty".to_string()))
}

async fn cart_items(
    transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    cart_id: Uuid,
) -> Result<Vec<OrderItem>, ApiError> {
    let rows = sqlx::query(
        r#"
        SELECT ci.book_id, b.title, ci.quantity, b.sale_price AS unit_price,
               (ci.quantity * b.sale_price) AS line_total
        FROM cart_items ci
        INNER JOIN books b ON b.id = ci.book_id
        WHERE ci.cart_id = $1
        "#,
    )
    .bind(cart_id)
    .fetch_all(&mut **transaction)
    .await?;

    Ok(rows.into_iter().map(order_item_from_row).collect())
}

async fn insert_timeline(
    transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    order_id: Uuid,
    status: &str,
    note: Option<&str>,
    created_by: Option<Uuid>,
) -> Result<(), ApiError> {
    sqlx::query(
        r#"
        INSERT INTO order_timeline (order_id, status, note, created_by)
        VALUES ($1, $2, $3, $4)
        "#,
    )
    .bind(order_id)
    .bind(status)
    .bind(note)
    .bind(created_by)
    .execute(&mut **transaction)
    .await?;
    Ok(())
}

async fn rows_to_orders(pool: &PgPool, rows: Vec<PgRow>) -> Result<Vec<Order>, ApiError> {
    let mut orders = Vec::with_capacity(rows.len());
    for row in rows {
        orders.push(row_to_order(pool, row).await?);
    }
    Ok(orders)
}

async fn row_to_order(pool: &PgPool, row: PgRow) -> Result<Order, ApiError> {
    let order_id = row.get("id");
    let items = sqlx::query(ORDER_ITEMS_SELECT)
        .bind(order_id)
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(order_item_from_row)
        .collect();
    let delivery = sqlx::query(DELIVERY_SELECT)
        .bind(order_id)
        .fetch_optional(pool)
        .await?
        .map(delivery_from_row);

    Ok(Order {
        id: order_id,
        user_id: row.get("user_id"),
        address_id: row.get("address_id"),
        status: parse_order_status(row.get::<String, _>("status").as_str())?,
        payment_provider: row
            .get::<Option<String>, _>("payment_provider")
            .as_deref()
            .map(parse_payment_provider)
            .transpose()?,
        payment_status: parse_payment_status(row.get::<String, _>("payment_status").as_str())?,
        subtotal: row.get("subtotal"),
        shipping_fee: row.get("shipping_fee"),
        discount_total: row.get("discount_total"),
        total: row.get("total"),
        items,
        delivery,
        created_at: row.get("created_at"),
    })
}

fn order_item_from_row(row: PgRow) -> OrderItem {
    OrderItem {
        book_id: row.get("book_id"),
        title: row.get("title"),
        quantity: row.get("quantity"),
        unit_price: row.get("unit_price"),
        line_total: row.get("line_total"),
    }
}

fn delivery_from_row(row: PgRow) -> DeliveryAssignment {
    DeliveryAssignment {
        id: row.get("id"),
        order_id: row.get("order_id"),
        agent_name: row.get("agent_name"),
        agent_phone: row.get("agent_phone"),
        status: parse_delivery_status(row.get::<String, _>("status").as_str())
            .unwrap_or(DeliveryStatus::Assigned),
        note: row.get("note"),
    }
}

fn parse_order_status(value: &str) -> Result<OrderStatus, ApiError> {
    match value {
        "pending" => Ok(OrderStatus::Pending),
        "confirmed" => Ok(OrderStatus::Confirmed),
        "picking" => Ok(OrderStatus::Picking),
        "packed" => Ok(OrderStatus::Packed),
        "out_for_delivery" => Ok(OrderStatus::OutForDelivery),
        "delivered" => Ok(OrderStatus::Delivered),
        "cancelled" => Ok(OrderStatus::Cancelled),
        "refunded" => Ok(OrderStatus::Refunded),
        other => Err(ApiError::Config(format!("unknown order status: {other}"))),
    }
}

fn parse_payment_provider(value: &str) -> Result<PaymentProvider, ApiError> {
    match value {
        "sslcommerz" => Ok(PaymentProvider::Sslcommerz),
        "bkash" => Ok(PaymentProvider::Bkash),
        "stripe" => Ok(PaymentProvider::Stripe),
        "nagad" => Ok(PaymentProvider::Nagad),
        other => Err(ApiError::Config(format!(
            "unknown payment provider: {other}"
        ))),
    }
}

fn parse_payment_status(value: &str) -> Result<PaymentStatus, ApiError> {
    match value {
        "pending" => Ok(PaymentStatus::Pending),
        "paid" => Ok(PaymentStatus::Paid),
        "failed" => Ok(PaymentStatus::Failed),
        "cancelled" => Ok(PaymentStatus::Cancelled),
        "refunded" => Ok(PaymentStatus::Refunded),
        other => Err(ApiError::Config(format!("unknown payment status: {other}"))),
    }
}

fn parse_delivery_status(value: &str) -> Result<DeliveryStatus, ApiError> {
    match value {
        "assigned" => Ok(DeliveryStatus::Assigned),
        "picked_up" => Ok(DeliveryStatus::PickedUp),
        "delivered" => Ok(DeliveryStatus::Delivered),
        "failed" => Ok(DeliveryStatus::Failed),
        other => Err(ApiError::Config(format!(
            "unknown delivery status: {other}"
        ))),
    }
}

const ORDER_SELECT_BY_ID: &str = r#"
    SELECT id, user_id, address_id, status, payment_provider, payment_status,
           subtotal, shipping_fee, discount_total, total, created_at
    FROM orders
    WHERE id = $1
"#;

const ORDER_SELECT_BY_USER: &str = r#"
    SELECT id, user_id, address_id, status, payment_provider, payment_status,
           subtotal, shipping_fee, discount_total, total, created_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
"#;

const ORDER_SELECT_BY_USER_AND_ID: &str = r#"
    SELECT id, user_id, address_id, status, payment_provider, payment_status,
           subtotal, shipping_fee, discount_total, total, created_at
    FROM orders
    WHERE user_id = $1 AND id = $2
"#;

const ORDER_SELECT_ADMIN: &str = r#"
    SELECT id, user_id, address_id, status, payment_provider, payment_status,
           subtotal, shipping_fee, discount_total, total, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
"#;

const ORDER_SELECT_BY_STATUS: &str = r#"
    SELECT id, user_id, address_id, status, payment_provider, payment_status,
           subtotal, shipping_fee, discount_total, total, created_at
    FROM orders
    WHERE status = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
"#;

const ORDER_ITEMS_SELECT: &str = r#"
    SELECT book_id, title, quantity, unit_price, line_total
    FROM order_items
    WHERE order_id = $1
    ORDER BY id
"#;

const DELIVERY_SELECT: &str = r#"
    SELECT id, order_id, agent_name, agent_phone, status, note
    FROM delivery_assignments
    WHERE order_id = $1
"#;
