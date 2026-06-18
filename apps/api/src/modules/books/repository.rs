use sqlx::{PgPool, Row, postgres::PgRow};
use uuid::Uuid;

use crate::error::ApiError;

use super::model::{
    Author, Book, Category, Publisher, UpsertAuthorRequest, UpsertBookRequest,
    UpsertCategoryRequest, UpsertPublisherRequest,
};

#[derive(Clone)]
pub struct CatalogRepository {
    pool: PgPool,
}

impl CatalogRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn list_books(
        &self,
        limit: i64,
        offset: i64,
        search: Option<String>,
    ) -> Result<Vec<Book>, ApiError> {
        let rows = if let Some(search) = search {
            sqlx::query(BOOK_SELECT_SEARCH)
                .bind(search)
                .bind(limit)
                .bind(offset)
                .fetch_all(&self.pool)
                .await?
        } else {
            sqlx::query(BOOK_SELECT)
                .bind(limit)
                .bind(offset)
                .fetch_all(&self.pool)
                .await?
        };

        rows.into_iter().map(book_from_row).collect()
    }

    pub async fn find_book_by_slug(&self, slug: &str) -> Result<Option<Book>, ApiError> {
        let row = sqlx::query(BOOK_BY_SLUG)
            .bind(slug)
            .fetch_optional(&self.pool)
            .await?;

        row.map(book_from_row).transpose()
    }

    pub async fn create_book(&self, payload: &UpsertBookRequest) -> Result<Book, ApiError> {
        let mut transaction = self.pool.begin().await?;

        let book_id: Uuid = sqlx::query(
            r#"
            INSERT INTO books (
                title, slug, description, author_id, publisher_id,
                price, sale_price, stock, cover_image_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
            "#,
        )
        .bind(&payload.title)
        .bind(&payload.slug)
        .bind(&payload.description)
        .bind(payload.author_id)
        .bind(payload.publisher_id)
        .bind(payload.price)
        .bind(payload.sale_price)
        .bind(payload.stock)
        .bind(&payload.cover_image_url)
        .fetch_one(&mut *transaction)
        .await?
        .try_get("id")?;

        for category_id in &payload.category_ids {
            sqlx::query("INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2)")
                .bind(book_id)
                .bind(*category_id)
                .execute(&mut *transaction)
                .await?;
        }

        transaction.commit().await?;
        self.find_book_by_id(book_id)
            .await?
            .ok_or(ApiError::NotFound)
    }

    pub async fn update_book(
        &self,
        id: Uuid,
        payload: &UpsertBookRequest,
    ) -> Result<Book, ApiError> {
        let mut transaction = self.pool.begin().await?;

        let updated = sqlx::query(
            r#"
            UPDATE books
            SET title = $2,
                slug = $3,
                description = $4,
                author_id = $5,
                publisher_id = $6,
                price = $7,
                sale_price = $8,
                stock = $9,
                cover_image_url = $10,
                updated_at = now()
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(&payload.title)
        .bind(&payload.slug)
        .bind(&payload.description)
        .bind(payload.author_id)
        .bind(payload.publisher_id)
        .bind(payload.price)
        .bind(payload.sale_price)
        .bind(payload.stock)
        .bind(&payload.cover_image_url)
        .execute(&mut *transaction)
        .await?;

        if updated.rows_affected() == 0 {
            return Err(ApiError::NotFound);
        }

        sqlx::query("DELETE FROM book_categories WHERE book_id = $1")
            .bind(id)
            .execute(&mut *transaction)
            .await?;

        for category_id in &payload.category_ids {
            sqlx::query("INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2)")
                .bind(id)
                .bind(*category_id)
                .execute(&mut *transaction)
                .await?;
        }

        transaction.commit().await?;
        self.find_book_by_id(id).await?.ok_or(ApiError::NotFound)
    }

    pub async fn delete_book(&self, id: Uuid) -> Result<(), ApiError> {
        delete_by_id(&self.pool, "books", id).await
    }

    pub async fn list_authors(&self) -> Result<Vec<Author>, ApiError> {
        let rows = sqlx::query("SELECT id, name, slug FROM authors ORDER BY name")
            .fetch_all(&self.pool)
            .await?;
        Ok(rows.into_iter().map(author_from_row).collect())
    }

    pub async fn create_author(&self, payload: &UpsertAuthorRequest) -> Result<Author, ApiError> {
        let row = sqlx::query(
            "INSERT INTO authors (name, slug) VALUES ($1, $2) RETURNING id, name, slug",
        )
        .bind(&payload.name)
        .bind(&payload.slug)
        .fetch_one(&self.pool)
        .await?;
        Ok(author_from_row(row))
    }

    pub async fn update_author(
        &self,
        id: Uuid,
        payload: &UpsertAuthorRequest,
    ) -> Result<Author, ApiError> {
        let row = sqlx::query(
            r#"
            UPDATE authors
            SET name = $2, slug = $3, updated_at = now()
            WHERE id = $1
            RETURNING id, name, slug
            "#,
        )
        .bind(id)
        .bind(&payload.name)
        .bind(&payload.slug)
        .fetch_optional(&self.pool)
        .await?;

        row.map(author_from_row).ok_or(ApiError::NotFound)
    }

    pub async fn delete_author(&self, id: Uuid) -> Result<(), ApiError> {
        delete_by_id(&self.pool, "authors", id).await
    }

    pub async fn list_publishers(&self) -> Result<Vec<Publisher>, ApiError> {
        let rows = sqlx::query("SELECT id, name, slug FROM publishers ORDER BY name")
            .fetch_all(&self.pool)
            .await?;
        Ok(rows.into_iter().map(publisher_from_row).collect())
    }

    pub async fn create_publisher(
        &self,
        payload: &UpsertPublisherRequest,
    ) -> Result<Publisher, ApiError> {
        let row = sqlx::query(
            "INSERT INTO publishers (name, slug) VALUES ($1, $2) RETURNING id, name, slug",
        )
        .bind(&payload.name)
        .bind(&payload.slug)
        .fetch_one(&self.pool)
        .await?;
        Ok(publisher_from_row(row))
    }

    pub async fn update_publisher(
        &self,
        id: Uuid,
        payload: &UpsertPublisherRequest,
    ) -> Result<Publisher, ApiError> {
        let row = sqlx::query(
            r#"
            UPDATE publishers
            SET name = $2, slug = $3, updated_at = now()
            WHERE id = $1
            RETURNING id, name, slug
            "#,
        )
        .bind(id)
        .bind(&payload.name)
        .bind(&payload.slug)
        .fetch_optional(&self.pool)
        .await?;

        row.map(publisher_from_row).ok_or(ApiError::NotFound)
    }

    pub async fn delete_publisher(&self, id: Uuid) -> Result<(), ApiError> {
        delete_by_id(&self.pool, "publishers", id).await
    }

    pub async fn list_categories(&self) -> Result<Vec<Category>, ApiError> {
        let rows = sqlx::query("SELECT id, name, slug FROM categories ORDER BY name")
            .fetch_all(&self.pool)
            .await?;
        Ok(rows.into_iter().map(category_from_row).collect())
    }

    pub async fn create_category(
        &self,
        payload: &UpsertCategoryRequest,
    ) -> Result<Category, ApiError> {
        let row = sqlx::query(
            "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id, name, slug",
        )
        .bind(&payload.name)
        .bind(&payload.slug)
        .fetch_one(&self.pool)
        .await?;
        Ok(category_from_row(row))
    }

    pub async fn update_category(
        &self,
        id: Uuid,
        payload: &UpsertCategoryRequest,
    ) -> Result<Category, ApiError> {
        let row = sqlx::query(
            r#"
            UPDATE categories
            SET name = $2, slug = $3, updated_at = now()
            WHERE id = $1
            RETURNING id, name, slug
            "#,
        )
        .bind(id)
        .bind(&payload.name)
        .bind(&payload.slug)
        .fetch_optional(&self.pool)
        .await?;

        row.map(category_from_row).ok_or(ApiError::NotFound)
    }

    pub async fn delete_category(&self, id: Uuid) -> Result<(), ApiError> {
        delete_by_id(&self.pool, "categories", id).await
    }

    async fn find_book_by_id(&self, id: Uuid) -> Result<Option<Book>, ApiError> {
        let row = sqlx::query(BOOK_BY_ID)
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;

        row.map(book_from_row).transpose()
    }
}

async fn delete_by_id(pool: &PgPool, table: &'static str, id: Uuid) -> Result<(), ApiError> {
    let statement = format!("DELETE FROM {table} WHERE id = $1");
    let result = sqlx::query(&statement).bind(id).execute(pool).await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound);
    }

    Ok(())
}

fn book_from_row(row: PgRow) -> Result<Book, ApiError> {
    let categories: serde_json::Value = row.try_get("categories")?;

    Ok(Book {
        id: row.try_get("id")?,
        title: row.try_get("title")?,
        slug: row.try_get("slug")?,
        description: row.try_get("description")?,
        author: Author {
            id: row.try_get("author_id")?,
            name: row.try_get("author_name")?,
            slug: row.try_get("author_slug")?,
        },
        publisher: Publisher {
            id: row.try_get("publisher_id")?,
            name: row.try_get("publisher_name")?,
            slug: row.try_get("publisher_slug")?,
        },
        categories: serde_json::from_value(categories)
            .map_err(|error| ApiError::Validation(error.to_string()))?,
        price: row.try_get("price")?,
        sale_price: row.try_get("sale_price")?,
        stock: row.try_get("stock")?,
        cover_image_url: row.try_get("cover_image_url")?,
    })
}

fn author_from_row(row: PgRow) -> Author {
    Author {
        id: row.get("id"),
        name: row.get("name"),
        slug: row.get("slug"),
    }
}

fn publisher_from_row(row: PgRow) -> Publisher {
    Publisher {
        id: row.get("id"),
        name: row.get("name"),
        slug: row.get("slug"),
    }
}

fn category_from_row(row: PgRow) -> Category {
    Category {
        id: row.get("id"),
        name: row.get("name"),
        slug: row.get("slug"),
    }
}

const BOOK_SELECT: &str = r#"
    SELECT
        b.id,
        b.title,
        b.slug,
        b.description,
        b.price,
        b.sale_price,
        b.stock,
        b.cover_image_url,
        a.id AS author_id,
        a.name AS author_name,
        a.slug AS author_slug,
        p.id AS publisher_id,
        p.name AS publisher_name,
        p.slug AS publisher_slug,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'slug', c.slug
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories
    FROM books b
    INNER JOIN authors a ON a.id = b.author_id
    INNER JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN book_categories bc ON bc.book_id = b.id
    LEFT JOIN categories c ON c.id = bc.category_id
    GROUP BY b.id, a.id, p.id
    ORDER BY b.created_at DESC
    LIMIT $1 OFFSET $2
"#;

const BOOK_SELECT_SEARCH: &str = r#"
    SELECT
        b.id,
        b.title,
        b.slug,
        b.description,
        b.price,
        b.sale_price,
        b.stock,
        b.cover_image_url,
        a.id AS author_id,
        a.name AS author_name,
        a.slug AS author_slug,
        p.id AS publisher_id,
        p.name AS publisher_name,
        p.slug AS publisher_slug,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'slug', c.slug
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories
    FROM books b
    INNER JOIN authors a ON a.id = b.author_id
    INNER JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN book_categories bc ON bc.book_id = b.id
    LEFT JOIN categories c ON c.id = bc.category_id
    WHERE b.title ILIKE $1
       OR b.slug ILIKE $1
       OR a.name ILIKE $1
       OR p.name ILIKE $1
    GROUP BY b.id, a.id, p.id
    ORDER BY b.created_at DESC
    LIMIT $2 OFFSET $3
"#;

const BOOK_BY_ID: &str = r#"
    SELECT
        b.id,
        b.title,
        b.slug,
        b.description,
        b.price,
        b.sale_price,
        b.stock,
        b.cover_image_url,
        a.id AS author_id,
        a.name AS author_name,
        a.slug AS author_slug,
        p.id AS publisher_id,
        p.name AS publisher_name,
        p.slug AS publisher_slug,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'slug', c.slug
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories
    FROM books b
    INNER JOIN authors a ON a.id = b.author_id
    INNER JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN book_categories bc ON bc.book_id = b.id
    LEFT JOIN categories c ON c.id = bc.category_id
    WHERE b.id = $1
    GROUP BY b.id, a.id, p.id
"#;

const BOOK_BY_SLUG: &str = r#"
    SELECT
        b.id,
        b.title,
        b.slug,
        b.description,
        b.price,
        b.sale_price,
        b.stock,
        b.cover_image_url,
        a.id AS author_id,
        a.name AS author_name,
        a.slug AS author_slug,
        p.id AS publisher_id,
        p.name AS publisher_name,
        p.slug AS publisher_slug,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'slug', c.slug
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories
    FROM books b
    INNER JOIN authors a ON a.id = b.author_id
    INNER JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN book_categories bc ON bc.book_id = b.id
    LEFT JOIN categories c ON c.id = bc.category_id
    WHERE b.slug = $1
    GROUP BY b.id, a.id, p.id
"#;
