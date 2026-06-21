use sqlx::{PgPool, Row, postgres::PgRow};
use uuid::Uuid;

use crate::{error::ApiError, models::ids::UserId};

use super::model::{BarcodeScanResult, InventoryItem, StockMovement, WarehouseOrder};

#[derive(Clone)]
pub struct InventoryRepository {
    pool: PgPool,
}

impl InventoryRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn list_inventory(
        &self,
        limit: i64,
        offset: i64,
        search: Option<String>,
        stock_status: Option<&str>,
    ) -> Result<Vec<InventoryItem>, ApiError> {
        let rows = match (search, stock_status) {
            (Some(search), Some("low")) => {
                sqlx::query(INVENTORY_SEARCH_LOW)
                    .bind(search)
                    .bind(limit)
                    .bind(offset)
                    .fetch_all(&self.pool)
                    .await?
            }
            (Some(search), Some("out")) => {
                sqlx::query(INVENTORY_SEARCH_OUT)
                    .bind(search)
                    .bind(limit)
                    .bind(offset)
                    .fetch_all(&self.pool)
                    .await?
            }
            (Some(search), _) => {
                sqlx::query(INVENTORY_SEARCH)
                    .bind(search)
                    .bind(limit)
                    .bind(offset)
                    .fetch_all(&self.pool)
                    .await?
            }
            (None, Some("low")) => {
                sqlx::query(INVENTORY_LOW)
                    .bind(limit)
                    .bind(offset)
                    .fetch_all(&self.pool)
                    .await?
            }
            (None, Some("out")) => {
                sqlx::query(INVENTORY_OUT)
                    .bind(limit)
                    .bind(offset)
                    .fetch_all(&self.pool)
                    .await?
            }
            (None, _) => {
                sqlx::query(
                    r#"
            SELECT id AS book_id, title, slug, cover_image_url, stock
            FROM books
            ORDER BY updated_at DESC
            LIMIT $1 OFFSET $2
            "#,
                )
                .bind(limit)
                .bind(offset)
                .fetch_all(&self.pool)
                .await?
            }
        };

        Ok(rows.into_iter().map(inventory_item_from_row).collect())
    }

    pub async fn count_inventory(
        &self,
        search: Option<String>,
        stock_status: Option<&str>,
    ) -> Result<i64, ApiError> {
        let row =
            match (search, stock_status) {
                (Some(search), Some("low")) => {
                    sqlx::query(
                        r#"
                    SELECT COUNT(*)::BIGINT AS total
                    FROM books
                    WHERE (title ILIKE $1 OR slug ILIKE $1) AND stock > 0 AND stock <= 5
                    "#,
                    )
                    .bind(search)
                    .fetch_one(&self.pool)
                    .await?
                }
                (Some(search), Some("out")) => {
                    sqlx::query(
                        r#"
                    SELECT COUNT(*)::BIGINT AS total
                    FROM books
                    WHERE (title ILIKE $1 OR slug ILIKE $1) AND stock = 0
                    "#,
                    )
                    .bind(search)
                    .fetch_one(&self.pool)
                    .await?
                }
                (Some(search), _) => {
                    sqlx::query(
                        r#"
                    SELECT COUNT(*)::BIGINT AS total
                    FROM books
                    WHERE title ILIKE $1 OR slug ILIKE $1
                    "#,
                    )
                    .bind(search)
                    .fetch_one(&self.pool)
                    .await?
                }
                (None, Some("low")) => sqlx::query(
                    "SELECT COUNT(*)::BIGINT AS total FROM books WHERE stock > 0 AND stock <= 5",
                )
                .fetch_one(&self.pool)
                .await?,
                (None, Some("out")) => {
                    sqlx::query("SELECT COUNT(*)::BIGINT AS total FROM books WHERE stock = 0")
                        .fetch_one(&self.pool)
                        .await?
                }
                (None, _) => {
                    sqlx::query("SELECT COUNT(*)::BIGINT AS total FROM books")
                        .fetch_one(&self.pool)
                        .await?
                }
            };

        Ok(row.get("total"))
    }

    pub async fn update_stock(
        &self,
        book_id: Uuid,
        stock: i32,
        note: Option<&str>,
        actor: UserId,
    ) -> Result<InventoryItem, ApiError> {
        let mut transaction = self.pool.begin().await?;
        let warehouse_id = default_warehouse_id(&mut transaction).await?;
        let previous_stock: i32 = sqlx::query("SELECT stock FROM books WHERE id = $1")
            .bind(book_id)
            .fetch_optional(&mut *transaction)
            .await?
            .map(|row| row.get("stock"))
            .ok_or(ApiError::NotFound)?;
        let delta = stock - previous_stock;

        let row = sqlx::query(
            r#"
            UPDATE books
            SET stock = $2, updated_at = now()
            WHERE id = $1
            RETURNING id AS book_id, title, slug, cover_image_url, stock
            "#,
        )
        .bind(book_id)
        .bind(stock)
        .fetch_one(&mut *transaction)
        .await?;

        sqlx::query(
            r#"
            INSERT INTO stock_movements (warehouse_id, book_id, quantity_delta, reason, note, created_by)
            VALUES ($1, $2, $3, 'manual_adjustment', $4, $5)
            "#,
        )
        .bind(warehouse_id)
        .bind(book_id)
        .bind(delta)
        .bind(note)
        .bind(actor.0)
        .execute(&mut *transaction)
        .await?;

        transaction.commit().await?;
        Ok(inventory_item_from_row(row))
    }

    pub async fn movements(
        &self,
        book_id: Option<Uuid>,
        limit: i64,
    ) -> Result<Vec<StockMovement>, ApiError> {
        let rows = if let Some(book_id) = book_id {
            sqlx::query(MOVEMENTS_BY_BOOK)
                .bind(book_id)
                .bind(limit)
                .fetch_all(&self.pool)
                .await?
        } else {
            sqlx::query(MOVEMENTS_ALL)
                .bind(limit)
                .fetch_all(&self.pool)
                .await?
        };

        Ok(rows.into_iter().map(stock_movement_from_row).collect())
    }

    pub async fn warehouse_queue(
        &self,
        statuses: &[&str],
    ) -> Result<Vec<WarehouseOrder>, ApiError> {
        let rows = sqlx::query(WAREHOUSE_QUEUE)
            .bind(statuses)
            .fetch_all(&self.pool)
            .await?;
        Ok(rows.into_iter().map(warehouse_order_from_row).collect())
    }

    pub async fn update_orders_status(
        &self,
        order_ids: &[Uuid],
        status: &str,
        note: Option<&str>,
        actor: UserId,
    ) -> Result<Vec<WarehouseOrder>, ApiError> {
        let mut transaction = self.pool.begin().await?;
        for order_id in order_ids {
            sqlx::query("UPDATE orders SET status = $2, updated_at = now() WHERE id = $1")
                .bind(order_id)
                .bind(status)
                .execute(&mut *transaction)
                .await?;
            sqlx::query(
                "INSERT INTO order_timeline (order_id, status, note, created_by) VALUES ($1, $2, $3, $4)",
            )
            .bind(order_id)
            .bind(status)
            .bind(note)
            .bind(actor.0)
            .execute(&mut *transaction)
            .await?;
        }
        transaction.commit().await?;
        self.warehouse_orders_by_ids(order_ids).await
    }

    pub async fn append_order_timeline(
        &self,
        order_id: Uuid,
        status: &str,
        note: Option<&str>,
        actor: UserId,
    ) -> Result<WarehouseOrder, ApiError> {
        sqlx::query(
            "INSERT INTO order_timeline (order_id, status, note, created_by) VALUES ($1, $2, $3, $4)",
        )
        .bind(order_id)
        .bind(status)
        .bind(note)
        .bind(actor.0)
        .execute(&self.pool)
        .await?;
        self.warehouse_order_by_id(order_id).await
    }

    pub async fn scan_barcode(
        &self,
        order_id: Uuid,
        barcode: &str,
    ) -> Result<BarcodeScanResult, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT oi.book_id, oi.title
            FROM order_items oi
            INNER JOIN books b ON b.id = oi.book_id
            WHERE oi.order_id = $1 AND b.barcode = $2
            "#,
        )
        .bind(order_id)
        .bind(barcode)
        .fetch_optional(&self.pool)
        .await?;

        Ok(match row {
            Some(row) => BarcodeScanResult {
                order_id,
                barcode: barcode.to_string(),
                matched: true,
                book_id: row.get("book_id"),
                title: row.get("title"),
            },
            None => BarcodeScanResult {
                order_id,
                barcode: barcode.to_string(),
                matched: false,
                book_id: None,
                title: None,
            },
        })
    }

    async fn warehouse_orders_by_ids(
        &self,
        order_ids: &[Uuid],
    ) -> Result<Vec<WarehouseOrder>, ApiError> {
        let rows = sqlx::query(WAREHOUSE_BY_IDS)
            .bind(order_ids)
            .fetch_all(&self.pool)
            .await?;
        Ok(rows.into_iter().map(warehouse_order_from_row).collect())
    }

    async fn warehouse_order_by_id(&self, order_id: Uuid) -> Result<WarehouseOrder, ApiError> {
        let row = sqlx::query(WAREHOUSE_BY_ID)
            .bind(order_id)
            .fetch_optional(&self.pool)
            .await?
            .ok_or(ApiError::NotFound)?;
        Ok(warehouse_order_from_row(row))
    }
}

async fn default_warehouse_id(
    transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
) -> Result<Uuid, ApiError> {
    let row = sqlx::query(
        "SELECT id FROM warehouses WHERE is_default = true ORDER BY created_at LIMIT 1",
    )
    .fetch_one(&mut **transaction)
    .await?;

    Ok(row.get("id"))
}

fn inventory_item_from_row(row: PgRow) -> InventoryItem {
    InventoryItem {
        book_id: row.get("book_id"),
        title: row.get("title"),
        slug: row.get("slug"),
        cover_image_url: row.get("cover_image_url"),
        stock: row.get("stock"),
    }
}

fn stock_movement_from_row(row: PgRow) -> StockMovement {
    StockMovement {
        id: row.get("id"),
        warehouse_id: row.get("warehouse_id"),
        book_id: row.get("book_id"),
        quantity_delta: row.get("quantity_delta"),
        reason: row.get("reason"),
        note: row.get("note"),
        created_by: row.get("created_by"),
        created_at: row.get("created_at"),
    }
}

fn warehouse_order_from_row(row: PgRow) -> WarehouseOrder {
    WarehouseOrder {
        order_id: row.get("order_id"),
        status: row.get("status"),
        customer_id: row.get("customer_id"),
        item_count: row.get("item_count"),
        total: row.get("total"),
        created_at: row.get("created_at"),
    }
}

const MOVEMENTS_ALL: &str = r#"
    SELECT id, warehouse_id, book_id, quantity_delta, reason, note, created_by, created_at
    FROM stock_movements
    ORDER BY created_at DESC
    LIMIT $1
"#;

const MOVEMENTS_BY_BOOK: &str = r#"
    SELECT id, warehouse_id, book_id, quantity_delta, reason, note, created_by, created_at
    FROM stock_movements
    WHERE book_id = $1
    ORDER BY created_at DESC
    LIMIT $2
"#;

const INVENTORY_SEARCH: &str = r#"
    SELECT id AS book_id, title, slug, cover_image_url, stock
    FROM books
    WHERE title ILIKE $1 OR slug ILIKE $1
    ORDER BY updated_at DESC
    LIMIT $2 OFFSET $3
"#;

const INVENTORY_LOW: &str = r#"
    SELECT id AS book_id, title, slug, cover_image_url, stock
    FROM books
    WHERE stock > 0 AND stock <= 5
    ORDER BY updated_at DESC
    LIMIT $1 OFFSET $2
"#;

const INVENTORY_OUT: &str = r#"
    SELECT id AS book_id, title, slug, cover_image_url, stock
    FROM books
    WHERE stock = 0
    ORDER BY updated_at DESC
    LIMIT $1 OFFSET $2
"#;

const INVENTORY_SEARCH_LOW: &str = r#"
    SELECT id AS book_id, title, slug, cover_image_url, stock
    FROM books
    WHERE (title ILIKE $1 OR slug ILIKE $1) AND stock > 0 AND stock <= 5
    ORDER BY updated_at DESC
    LIMIT $2 OFFSET $3
"#;

const INVENTORY_SEARCH_OUT: &str = r#"
    SELECT id AS book_id, title, slug, cover_image_url, stock
    FROM books
    WHERE (title ILIKE $1 OR slug ILIKE $1) AND stock = 0
    ORDER BY updated_at DESC
    LIMIT $2 OFFSET $3
"#;

const WAREHOUSE_QUEUE: &str = r#"
    SELECT o.id AS order_id, o.status, o.user_id AS customer_id,
           COALESCE(SUM(oi.quantity), 0)::BIGINT AS item_count,
           o.total, o.created_at
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status = ANY($1)
    GROUP BY o.id
    ORDER BY o.created_at
"#;

const WAREHOUSE_BY_IDS: &str = r#"
    SELECT o.id AS order_id, o.status, o.user_id AS customer_id,
           COALESCE(SUM(oi.quantity), 0)::BIGINT AS item_count,
           o.total, o.created_at
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.id = ANY($1)
    GROUP BY o.id
    ORDER BY o.created_at
"#;

const WAREHOUSE_BY_ID: &str = r#"
    SELECT o.id AS order_id, o.status, o.user_id AS customer_id,
           COALESCE(SUM(oi.quantity), 0)::BIGINT AS item_count,
           o.total, o.created_at
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.id = $1
    GROUP BY o.id
"#;
