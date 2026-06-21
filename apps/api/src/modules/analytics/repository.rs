use sqlx::{PgPool, Row};

use crate::error::ApiError;

use super::model::{
    CohortReport, DashboardMetrics, DeliveryReport, InventoryReport, MoneyReport, RetentionReport,
    WarehouseReport,
};

#[derive(Clone)]
pub struct AnalyticsRepository {
    pool: PgPool,
}

impl AnalyticsRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn dashboard(&self) -> Result<DashboardMetrics, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT
              (SELECT COUNT(*) FROM users WHERE role = 'customer')::BIGINT AS total_customers,
              (SELECT COUNT(*) FROM books)::BIGINT AS total_books,
              (SELECT COUNT(*) FROM orders)::BIGINT AS total_orders,
              (SELECT COUNT(*) FROM orders WHERE status = 'pending')::BIGINT AS pending_orders,
              COALESCE((SELECT SUM(total) FROM orders WHERE payment_status = 'paid'), 0)::BIGINT AS paid_revenue
            "#,
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(DashboardMetrics {
            total_customers: row.get("total_customers"),
            total_books: row.get("total_books"),
            total_orders: row.get("total_orders"),
            pending_orders: row.get("pending_orders"),
            paid_revenue: row.get("paid_revenue"),
        })
    }

    pub async fn money_report(&self) -> Result<MoneyReport, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT
              COALESCE(SUM(total), 0)::BIGINT AS gmv,
              COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0)::BIGINT AS paid_revenue,
              COALESCE(AVG(total), 0)::BIGINT AS average_order_value
            FROM orders
            "#,
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(MoneyReport {
            gross_merchandise_value: row.get("gmv"),
            paid_revenue: row.get("paid_revenue"),
            average_order_value: row.get("average_order_value"),
        })
    }

    pub async fn inventory_report(&self) -> Result<InventoryReport, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT
              COALESCE(SUM(stock), 0)::BIGINT AS total_stock,
              COUNT(*) FILTER (WHERE stock BETWEEN 1 AND 5)::BIGINT AS low_stock_books,
              COUNT(*) FILTER (WHERE stock = 0)::BIGINT AS out_of_stock_books,
              COALESCE(SUM(stock * sale_price), 0)::BIGINT AS estimated_stock_value
            FROM books
            "#,
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(InventoryReport {
            total_stock: row.get("total_stock"),
            low_stock_books: row.get("low_stock_books"),
            out_of_stock_books: row.get("out_of_stock_books"),
            estimated_stock_value: row.get("estimated_stock_value"),
        })
    }

    pub async fn warehouse_report(&self) -> Result<WarehouseReport, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT
              COUNT(*) FILTER (WHERE status IN ('pending', 'confirmed'))::BIGINT AS pending,
              COUNT(*) FILTER (WHERE status = 'picking')::BIGINT AS picking,
              COUNT(*) FILTER (WHERE status = 'packed')::BIGINT AS packed,
              COUNT(*) FILTER (WHERE status = 'out_for_delivery')::BIGINT AS out_for_delivery
            FROM orders
            "#,
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(WarehouseReport {
            pending: row.get("pending"),
            picking: row.get("picking"),
            packed: row.get("packed"),
            out_for_delivery: row.get("out_for_delivery"),
        })
    }

    pub async fn delivery_report(&self) -> Result<DeliveryReport, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT
              COUNT(*) FILTER (WHERE status = 'assigned')::BIGINT AS assigned,
              COUNT(*) FILTER (WHERE status = 'picked_up')::BIGINT AS picked_up,
              COUNT(*) FILTER (WHERE status = 'delivered')::BIGINT AS delivered,
              COUNT(*) FILTER (WHERE status = 'failed')::BIGINT AS failed
            FROM delivery_assignments
            "#,
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(DeliveryReport {
            assigned: row.get("assigned"),
            picked_up: row.get("picked_up"),
            delivered: row.get("delivered"),
            failed: row.get("failed"),
        })
    }

    pub async fn cohort_report(&self) -> Result<CohortReport, ApiError> {
        let row = sqlx::query(
            r#"
            WITH recent_customers AS (
              SELECT id FROM users
              WHERE role = 'customer' AND created_at >= now() - interval '30 days'
            )
            SELECT
              (SELECT COUNT(*) FROM recent_customers)::BIGINT AS new_customers_30d,
              (SELECT COUNT(*) FROM orders WHERE user_id IN (SELECT id FROM recent_customers))::BIGINT AS orders_from_new_customers_30d
            "#,
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(CohortReport {
            new_customers_30d: row.get("new_customers_30d"),
            orders_from_new_customers_30d: row.get("orders_from_new_customers_30d"),
        })
    }

    pub async fn retention_report(&self) -> Result<RetentionReport, ApiError> {
        let row = sqlx::query(
            r#"
            WITH customer_order_counts AS (
              SELECT user_id, COUNT(*)::BIGINT AS order_count
              FROM orders
              GROUP BY user_id
            )
            SELECT
              COUNT(*) FILTER (WHERE order_count > 1)::BIGINT AS repeat_customers,
              COUNT(*)::BIGINT AS customers_with_orders
            FROM customer_order_counts
            "#,
        )
        .fetch_one(&self.pool)
        .await?;
        let repeat_customers: i64 = row.get("repeat_customers");
        let customers_with_orders: i64 = row.get("customers_with_orders");
        let repeat_customer_rate = if customers_with_orders == 0 {
            0.0
        } else {
            repeat_customers as f64 / customers_with_orders as f64
        };
        Ok(RetentionReport {
            repeat_customers,
            customers_with_orders,
            repeat_customer_rate,
        })
    }
}
