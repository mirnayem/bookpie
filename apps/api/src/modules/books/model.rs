use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Author {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Publisher {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Book {
    pub id: Uuid,
    pub title: String,
    pub slug: String,
    pub description: Option<String>,
    pub author: Author,
    pub publisher: Publisher,
    pub categories: Vec<Category>,
    pub price: i32,
    pub sale_price: i32,
    pub stock: i32,
    pub cover_image_url: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertAuthorRequest {
    #[validate(length(min = 1, max = 160))]
    pub name: String,
    #[validate(length(min = 1, max = 180))]
    pub slug: String,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertPublisherRequest {
    #[validate(length(min = 1, max = 160))]
    pub name: String,
    #[validate(length(min = 1, max = 180))]
    pub slug: String,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertCategoryRequest {
    #[validate(length(min = 1, max = 160))]
    pub name: String,
    #[validate(length(min = 1, max = 180))]
    pub slug: String,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertBookRequest {
    #[validate(length(min = 1, max = 240))]
    pub title: String,
    #[validate(length(min = 1, max = 260))]
    pub slug: String,
    #[validate(length(max = 5000))]
    pub description: Option<String>,
    pub author_id: Uuid,
    pub publisher_id: Uuid,
    #[validate(length(min = 1))]
    pub category_ids: Vec<Uuid>,
    #[validate(range(min = 0))]
    pub price: i32,
    #[validate(range(min = 0))]
    pub sale_price: i32,
    #[validate(range(min = 0))]
    pub stock: i32,
    #[validate(url)]
    pub cover_image_url: Option<String>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct ListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

impl ListQuery {
    pub fn limit(&self) -> i64 {
        self.limit.unwrap_or(24).clamp(1, 100)
    }

    pub fn offset(&self) -> i64 {
        self.offset.unwrap_or(0).max(0)
    }
}
