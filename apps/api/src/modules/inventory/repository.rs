use sqlx::{PgPool, Row, postgres::PgRow};
use uuid::Uuid;

use crate::{error::ApiError, models::ids::UserId};

use super::model::{InventoryItem, StockMovement};

#[derive(Clone)]
pub struct InventoryRepository {
    pool: PgPool,
}

impl InventoryRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn list_inventory(
        &self,
        limit: i64,
        offset: i64,
        search: Option<String>,
        stock_status: Option<&str>,
    ) -> Result<Vec<InventoryItem>, ApiError> {
        let rows = match (search, stock_status) {
            (Some(search), Some("low")) => {
                sqlx::query(INVENTORY_SEARCH_LOW)
                    .bind(search)
                    .bind(limit)
                    .bind(offset)
                    .fetch_all(&self.pool)
                    .await?
            }
            (Some(search), Some("out")) => {
                sqlx::query(INVENTORY_SEARCH_OUT)
                    .bind(search)
                    .bind(limit)
                    .bind(offset)
                    .fetch_all(&self.pool)
                    .await?
            }
            (Some(search), _) => {
                sqlx::query(INVENTORY_SEARCH)
                    .bind(search)
                    .bind(limit)
                    .bind(offset)
                    .fetch_all(&self.pool)
                    .await?
            }
            (None, Some("low")) => {
                sqlx::query(INVENTORY_LOW)
                    .bind(limit)
                    .bind(offset)
                    .fetch_all(&self.pool)
                    .await?
            }
            (None, Some("out")) => {
                sqlx::query(INVENTORY_OUT)
                    .bind(limit)
                    .bind(offset)
                    .fetch_all(&self.pool)
                    .await?
            }
            (None, _) => {
                sqlx::query(
                    r#"
            SELECT id AS book_id, title, slug, cover_image_url, stock
            FROM books
            ORDER BY updated_at DESC
            LIMIT $1 OFFSET $2
            "#,
                )
                .bind(limit)
                .bind(offset)
                .fetch_all(&self.pool)
                .await?
            }
        };

        Ok(rows.into_iter().map(inventory_item_from_row).collect())
    }

    pub async fn update_stock(
        &self,
        book_id: Uuid,
        stock: i32,
        note: Option<&str>,
        actor: UserId,
    ) -> Result<InventoryItem, ApiError> {
        let mut transaction = self.pool.begin().await?;
        let warehouse_id = default_warehouse_id(&mut transaction).await?;
        let previous_stock: i32 = sqlx::query("SELECT stock FROM books WHERE id = $1")
            .bind(book_id)
            .fetch_optional(&mut *transaction)
            .await?
            .map(|row| row.get("stock"))
            .ok_or(ApiError::NotFound)?;
        let delta = stock - previous_stock;

        let row = sqlx::query(
            r#"
            UPDATE books
            SET stock = $2, updated_at = now()
            WHERE id = $1
            RETURNING id AS book_id, title, slug, cover_image_url, stock
            "#,
        )
        .bind(book_id)
        .bind(stock)
        .fetch_one(&mut *transaction)
        .await?;

        sqlx::query(
            r#"
            INSERT INTO stock_movements (warehouse_id, book_id, quantity_delta, reason, note, created_by)
            VALUES ($1, $2, $3, 'manual_adjustment', $4, $5)
            "#,
        )
        .bind(warehouse_id)
        .bind(book_id)
        .bind(delta)
        .bind(note)
        .bind(actor.0)
        .execute(&mut *transaction)
        .await?;

        transaction.commit().await?;
        Ok(inventory_item_from_row(row))
    }

    pub async fn movements(
        &self,
        book_id: Option<Uuid>,
        limit: i64,
    ) -> Result<Vec<StockMovement>, ApiError> {
        let rows = if let Some(book_id) = book_id {
            sqlx::query(MOVEMENTS_BY_BOOK)
                .bind(book_id)
                .bind(limit)
                .fetch_all(&self.pool)
                .await?
        } else {
            sqlx::query(MOVEMENTS_ALL)
                .bind(limit)
                .fetch_all(&self.pool)
                .await?
        };

        Ok(rows.into_iter().map(stock_movement_from_row).collect())
    }
}

async fn default_warehouse_id(
    transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
) -> Result<Uuid, ApiError> {
    let row = sqlx::query(
        "SELECT id FROM warehouses WHERE is_default = true ORDER BY created_at LIMIT 1",
    )
    .fetch_one(&mut **transaction)
    .await?;

    Ok(row.get("id"))
}

fn inventory_item_from_row(row: PgRow) -> InventoryItem {
    InventoryItem {
        book_id: row.get("book_id"),
        title: row.get("title"),
        slug: row.get("slug"),
        cover_image_url: row.get("cover_image_url"),
        stock: row.get("stock"),
    }
}

fn stock_movement_from_row(row: PgRow) -> StockMovement {
    StockMovement {
        id: row.get("id"),
        warehouse_id: row.get("warehouse_id"),
        book_id: row.get("book_id"),
        quantity_delta: row.get("quantity_delta"),
        reason: row.get("reason"),
        note: row.get("note"),
        created_by: row.get("created_by"),
        created_at: row.get("created_at"),
    }
}

const MOVEMENTS_ALL: &str = r#"
    SELECT id, warehouse_id, book_id, quantity_delta, reason, note, created_by, created_at
    FROM stock_movements
    ORDER BY created_at DESC
    LIMIT $1
"#;

const MOVEMENTS_BY_BOOK: &str = r#"
    SELECT id, warehouse_id, book_id, quantity_delta, reason, note, created_by, created_at
    FROM stock_movements
    WHERE book_id = $1
    ORDER BY created_at DESC
    LIMIT $2
"#;

const INVENTORY_SEARCH: &str = r#"
    SELECT id AS book_id, title, slug, cover_image_url, stock
    FROM books
    WHERE title ILIKE $1 OR slug ILIKE $1
    ORDER BY updated_at DESC
    LIMIT $2 OFFSET $3
"#;

const INVENTORY_LOW: &str = r#"
    SELECT id AS book_id, title, slug, cover_image_url, stock
    FROM books
    WHERE stock > 0 AND stock <= 5
    ORDER BY updated_at DESC
    LIMIT $1 OFFSET $2
"#;

const INVENTORY_OUT: &str = r#"
    SELECT id AS book_id, title, slug, cover_image_url, stock
    FROM books
    WHERE stock = 0
    ORDER BY updated_at DESC
    LIMIT $1 OFFSET $2
"#;

const INVENTORY_SEARCH_LOW: &str = r#"
    SELECT id AS book_id, title, slug, cover_image_url, stock
    FROM books
    WHERE (title ILIKE $1 OR slug ILIKE $1) AND stock > 0 AND stock <= 5
    ORDER BY updated_at DESC
    LIMIT $2 OFFSET $3
"#;

const INVENTORY_SEARCH_OUT: &str = r#"
    SELECT id AS book_id, title, slug, cover_image_url, stock
    FROM books
    WHERE (title ILIKE $1 OR slug ILIKE $1) AND stock = 0
    ORDER BY updated_at DESC
    LIMIT $2 OFFSET $3
"#;
