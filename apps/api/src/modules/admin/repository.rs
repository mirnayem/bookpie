use sqlx::{PgPool, Row};

use crate::error::ApiError;

use super::model::AdminDashboardSummary;

#[derive(Clone)]
pub struct AdminRepository {
    pool: PgPool,
}

impl AdminRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn dashboard_summary(&self) -> Result<AdminDashboardSummary, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT
              (SELECT COUNT(*) FROM users WHERE role = 'customer')::BIGINT AS total_customers,
              (SELECT COUNT(*) FROM books)::BIGINT AS total_books,
              (SELECT COUNT(*) FROM orders)::BIGINT AS total_orders,
              (SELECT COUNT(*) FROM orders WHERE status = 'pending')::BIGINT AS pending_orders,
              (SELECT COUNT(*) FROM books WHERE stock <= 5)::BIGINT AS low_stock_books,
              COALESCE((SELECT SUM(total) FROM orders WHERE payment_status = 'paid'), 0)::BIGINT AS paid_revenue
            "#,
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(AdminDashboardSummary {
            total_customers: row.get("total_customers"),
            total_books: row.get("total_books"),
            total_orders: row.get("total_orders"),
            pending_orders: row.get("pending_orders"),
            low_stock_books: row.get("low_stock_books"),
            paid_revenue: row.get("paid_revenue"),
        })
    }
}
