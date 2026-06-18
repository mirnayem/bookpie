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
pub struct Brand {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub logo_url: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub parent_id: Option<Uuid>,
    pub image_url: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductVariant {
    pub id: Uuid,
    pub book_id: Uuid,
    pub sku: String,
    pub title: String,
    pub attributes: serde_json::Value,
    pub price: i32,
    pub sale_price: i32,
    pub stock: i32,
    pub is_active: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductPricingRule {
    pub id: Uuid,
    pub book_id: Uuid,
    pub name: String,
    pub starts_at: Option<chrono::DateTime<chrono::Utc>>,
    pub ends_at: Option<chrono::DateTime<chrono::Utc>>,
    pub discount_percent: Option<i32>,
    pub fixed_sale_price: Option<i32>,
    pub is_active: bool,
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
    pub brand: Option<Brand>,
    pub categories: Vec<Category>,
    pub variants: Vec<ProductVariant>,
    pub pricing_rules: Vec<ProductPricingRule>,
    pub price: i32,
    pub sale_price: i32,
    pub warehouse_price: Option<i32>,
    pub stock: i32,
    pub cover_image_url: Option<String>,
    pub gallery_image_urls: Vec<String>,
    pub tags: Vec<String>,
    pub specifications: serde_json::Value,
    pub attributes: serde_json::Value,
    pub seo_title: Option<String>,
    pub seo_description: Option<String>,
    pub sku: Option<String>,
    pub barcode: Option<String>,
    pub dynamic_pricing_enabled: bool,
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
    pub parent_id: Option<Uuid>,
    #[validate(url)]
    pub image_url: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertBrandRequest {
    #[validate(length(min = 1, max = 160))]
    pub name: String,
    #[validate(length(min = 1, max = 180))]
    pub slug: String,
    #[validate(url)]
    pub logo_url: Option<String>,
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
    pub brand_id: Option<Uuid>,
    #[validate(length(min = 1))]
    pub category_ids: Vec<Uuid>,
    #[validate(range(min = 0))]
    pub price: i32,
    #[validate(range(min = 0))]
    pub sale_price: i32,
    #[validate(range(min = 0))]
    pub warehouse_price: Option<i32>,
    #[validate(range(min = 0))]
    pub stock: i32,
    #[validate(url)]
    pub cover_image_url: Option<String>,
    pub gallery_image_urls: Vec<String>,
    pub tags: Vec<String>,
    pub specifications: serde_json::Value,
    pub attributes: serde_json::Value,
    #[validate(length(max = 180))]
    pub seo_title: Option<String>,
    #[validate(length(max = 320))]
    pub seo_description: Option<String>,
    #[validate(length(max = 80))]
    pub sku: Option<String>,
    #[validate(length(max = 80))]
    pub barcode: Option<String>,
    pub dynamic_pricing_enabled: bool,
}

#[derive(Clone, Debug, Deserialize)]
pub struct ListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub search: Option<String>,
}

impl ListQuery {
    pub fn limit(&self) -> i64 {
        self.limit.unwrap_or(24).clamp(1, 100)
    }

    pub fn offset(&self) -> i64 {
        self.offset.unwrap_or(0).max(0)
    }

    pub fn search(&self) -> Option<String> {
        self.search
            .as_deref()
            .map(str::trim)
            .filter(|value| value.len() >= 3)
            .map(|value| format!("%{value}%"))
    }
}
