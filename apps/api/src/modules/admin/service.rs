use sqlx::PgPool;

use crate::error::ApiError;

use super::{model::AdminDashboardSummary, repository::AdminRepository};

#[derive(Clone)]
pub struct AdminService {
    repository: AdminRepository,
}

impl AdminService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: AdminRepository::new(pool),
        }
    }

    pub async fn dashboard_summary(&self) -> Result<AdminDashboardSummary, ApiError> {
        self.repository.dashboard_summary().await
    }
}
