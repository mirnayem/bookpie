use serde::Serialize;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardMetrics {
    pub total_customers: i64,
    pub total_books: i64,
    pub total_orders: i64,
    pub pending_orders: i64,
    pub paid_revenue: i64,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MoneyReport {
    pub gross_merchandise_value: i64,
    pub paid_revenue: i64,
    pub average_order_value: i64,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InventoryReport {
    pub total_stock: i64,
    pub low_stock_books: i64,
    pub out_of_stock_books: i64,
    pub estimated_stock_value: i64,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WarehouseReport {
    pub pending: i64,
    pub picking: i64,
    pub packed: i64,
    pub out_for_delivery: i64,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeliveryReport {
    pub assigned: i64,
    pub picked_up: i64,
    pub delivered: i64,
    pub failed: i64,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CohortReport {
    pub new_customers_30d: i64,
    pub orders_from_new_customers_30d: i64,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RetentionReport {
    pub repeat_customers: i64,
    pub customers_with_orders: i64,
    pub repeat_customer_rate: f64,
}
