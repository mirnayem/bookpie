use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminDashboardSummary {
    pub total_customers: i64,
    pub total_books: i64,
    pub total_orders: i64,
    pub pending_orders: i64,
    pub low_stock_books: i64,
    pub paid_revenue: i64,
}
