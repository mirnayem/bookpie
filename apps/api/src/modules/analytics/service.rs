use sqlx::PgPool;

use crate::error::ApiError;

use super::{
    model::{
        CohortReport, DashboardMetrics, DeliveryReport, InventoryReport, MoneyReport,
        RetentionReport, WarehouseReport,
    },
    repository::AnalyticsRepository,
};

#[derive(Clone)]
pub struct AnalyticsService {
    repository: AnalyticsRepository,
}

impl AnalyticsService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: AnalyticsRepository::new(pool),
        }
    }

    pub async fn dashboard(&self) -> Result<DashboardMetrics, ApiError> {
        self.repository.dashboard().await
    }

    pub async fn money_report(&self) -> Result<MoneyReport, ApiError> {
        self.repository.money_report().await
    }

    pub async fn inventory_report(&self) -> Result<InventoryReport, ApiError> {
        self.repository.inventory_report().await
    }

    pub async fn warehouse_report(&self) -> Result<WarehouseReport, ApiError> {
        self.repository.warehouse_report().await
    }

    pub async fn delivery_report(&self) -> Result<DeliveryReport, ApiError> {
        self.repository.delivery_report().await
    }

    pub async fn cohort_report(&self) -> Result<CohortReport, ApiError> {
        self.repository.cohort_report().await
    }

    pub async fn retention_report(&self) -> Result<RetentionReport, ApiError> {
        self.repository.retention_report().await
    }
}
