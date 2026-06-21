use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductReview {
    pub id: Uuid,
    pub book_id: Uuid,
    pub user_id: Uuid,
    pub rating: i32,
    pub title: Option<String>,
    pub body: String,
    pub status: String,
    pub photo_urls: Vec<String>,
    pub moderated_by: Option<Uuid>,
    pub moderated_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductRatingSummary {
    pub book_id: Uuid,
    pub average_rating: f64,
    pub review_count: i64,
}

#[derive(Clone, Debug, Deserialize)]
pub struct ReviewListQuery {
    pub status: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateReviewRequest {
    #[validate(range(min = 1, max = 5))]
    pub rating: i32,
    #[validate(length(max = 120))]
    pub title: Option<String>,
    #[validate(length(min = 1, max = 2000))]
    pub body: String,
    #[validate(length(max = 6))]
    pub photo_urls: Option<Vec<String>>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct ModerateReviewRequest {
    #[validate(length(min = 1, max = 24))]
    pub status: String,
}
