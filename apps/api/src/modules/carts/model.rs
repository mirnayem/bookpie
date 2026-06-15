use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Cart {
    pub id: Uuid,
    pub user_id: Uuid,
    pub items: Vec<CartItem>,
    pub subtotal: i32,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CartItem {
    pub book_id: Uuid,
    pub title: String,
    pub slug: String,
    pub cover_image_url: Option<String>,
    pub unit_price: i32,
    pub original_price: i32,
    pub quantity: i32,
    pub line_total: i32,
    pub available_stock: i32,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct AddCartItemRequest {
    pub book_id: Uuid,
    #[validate(range(min = 1, max = 99))]
    pub quantity: i32,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCartItemRequest {
    #[validate(range(min = 1, max = 99))]
    pub quantity: i32,
}
