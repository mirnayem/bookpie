use sqlx::{PgPool, Row, postgres::PgRow};
use uuid::Uuid;

use crate::error::ApiError;

use super::model::{
    Author, Book, Brand, Category, Publisher, UpsertAuthorRequest, UpsertBookRequest,
    UpsertBrandRequest, UpsertCategoryRequest, UpsertPublisherRequest,
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

    pub async fn count_books(&self, search: Option<String>) -> Result<i64, ApiError> {
        let row = if let Some(search) = search {
            sqlx::query(
                r#"
                SELECT COUNT(DISTINCT b.id)::BIGINT AS total
                FROM books b
                JOIN authors a ON a.id = b.author_id
                JOIN publishers p ON p.id = b.publisher_id
                WHERE b.title ILIKE $1 OR b.slug ILIKE $1 OR a.name ILIKE $1 OR p.name ILIKE $1
                "#,
            )
            .bind(search)
            .fetch_one(&self.pool)
            .await?
        } else {
            sqlx::query("SELECT COUNT(*)::BIGINT AS total FROM books")
                .fetch_one(&self.pool)
                .await?
        };

        Ok(row.get("total"))
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
                brand_id, price, sale_price, warehouse_price, stock, cover_image_url,
                gallery_image_urls, tags, specifications, attributes, seo_title,
                seo_description, sku, barcode, dynamic_pricing_enabled
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING id
            "#,
        )
        .bind(&payload.title)
        .bind(&payload.slug)
        .bind(&payload.description)
        .bind(payload.author_id)
        .bind(payload.publisher_id)
        .bind(payload.brand_id)
        .bind(payload.price)
        .bind(payload.sale_price)
        .bind(payload.warehouse_price)
        .bind(payload.stock)
        .bind(&payload.cover_image_url)
        .bind(&payload.gallery_image_urls)
        .bind(&payload.tags)
        .bind(&payload.specifications)
        .bind(&payload.attributes)
        .bind(&payload.seo_title)
        .bind(&payload.seo_description)
        .bind(&payload.sku)
        .bind(&payload.barcode)
        .bind(payload.dynamic_pricing_enabled)
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
                brand_id = $7,
                price = $8,
                sale_price = $9,
                warehouse_price = $10,
                stock = $11,
                cover_image_url = $12,
                gallery_image_urls = $13,
                tags = $14,
                specifications = $15,
                attributes = $16,
                seo_title = $17,
                seo_description = $18,
                sku = $19,
                barcode = $20,
                dynamic_pricing_enabled = $21,
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
        .bind(payload.brand_id)
        .bind(payload.price)
        .bind(payload.sale_price)
        .bind(payload.warehouse_price)
        .bind(payload.stock)
        .bind(&payload.cover_image_url)
        .bind(&payload.gallery_image_urls)
        .bind(&payload.tags)
        .bind(&payload.specifications)
        .bind(&payload.attributes)
        .bind(&payload.seo_title)
        .bind(&payload.seo_description)
        .bind(&payload.sku)
        .bind(&payload.barcode)
        .bind(payload.dynamic_pricing_enabled)
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

    pub async fn list_authors_paginated(
        &self,
        limit: i64,
        offset: i64,
        search: Option<String>,
    ) -> Result<Vec<Author>, ApiError> {
        let rows = list_named_entity_rows(
            &self.pool,
            "authors",
            "SELECT id, name, slug FROM authors WHERE name ILIKE $1 OR slug ILIKE $1 ORDER BY name LIMIT $2 OFFSET $3",
            "SELECT id, name, slug FROM authors ORDER BY name LIMIT $1 OFFSET $2",
            limit,
            offset,
            search,
        )
        .await?;

        Ok(rows.into_iter().map(author_from_row).collect())
    }

    pub async fn count_authors(&self, search: Option<String>) -> Result<i64, ApiError> {
        count_named_entities(&self.pool, "authors", search).await
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

    pub async fn list_publishers_paginated(
        &self,
        limit: i64,
        offset: i64,
        search: Option<String>,
    ) -> Result<Vec<Publisher>, ApiError> {
        let rows = list_named_entity_rows(
            &self.pool,
            "publishers",
            "SELECT id, name, slug FROM publishers WHERE name ILIKE $1 OR slug ILIKE $1 ORDER BY name LIMIT $2 OFFSET $3",
            "SELECT id, name, slug FROM publishers ORDER BY name LIMIT $1 OFFSET $2",
            limit,
            offset,
            search,
        )
        .await?;

        Ok(rows.into_iter().map(publisher_from_row).collect())
    }

    pub async fn count_publishers(&self, search: Option<String>) -> Result<i64, ApiError> {
        count_named_entities(&self.pool, "publishers", search).await
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

    pub async fn list_brands(&self) -> Result<Vec<Brand>, ApiError> {
        let rows = sqlx::query("SELECT id, name, slug, logo_url FROM brands ORDER BY name")
            .fetch_all(&self.pool)
            .await?;
        Ok(rows.into_iter().map(brand_from_row).collect())
    }

    pub async fn list_brands_paginated(
        &self,
        limit: i64,
        offset: i64,
        search: Option<String>,
    ) -> Result<Vec<Brand>, ApiError> {
        let rows = if let Some(search) = search {
            sqlx::query(
                "SELECT id, name, slug, logo_url FROM brands WHERE name ILIKE $1 OR slug ILIKE $1 ORDER BY name LIMIT $2 OFFSET $3",
            )
            .bind(search)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?
        } else {
            sqlx::query(
                "SELECT id, name, slug, logo_url FROM brands ORDER BY name LIMIT $1 OFFSET $2",
            )
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?
        };

        Ok(rows.into_iter().map(brand_from_row).collect())
    }

    pub async fn count_brands(&self, search: Option<String>) -> Result<i64, ApiError> {
        count_named_entities(&self.pool, "brands", search).await
    }

    pub async fn create_brand(&self, payload: &UpsertBrandRequest) -> Result<Brand, ApiError> {
        let row = sqlx::query(
            "INSERT INTO brands (name, slug, logo_url) VALUES ($1, $2, $3) RETURNING id, name, slug, logo_url",
        )
        .bind(&payload.name)
        .bind(&payload.slug)
        .bind(&payload.logo_url)
        .fetch_one(&self.pool)
        .await?;
        Ok(brand_from_row(row))
    }

    pub async fn update_brand(
        &self,
        id: Uuid,
        payload: &UpsertBrandRequest,
    ) -> Result<Brand, ApiError> {
        let row = sqlx::query(
            r#"
            UPDATE brands
            SET name = $2, slug = $3, logo_url = $4, updated_at = now()
            WHERE id = $1
            RETURNING id, name, slug, logo_url
            "#,
        )
        .bind(id)
        .bind(&payload.name)
        .bind(&payload.slug)
        .bind(&payload.logo_url)
        .fetch_optional(&self.pool)
        .await?;

        row.map(brand_from_row).ok_or(ApiError::NotFound)
    }

    pub async fn delete_brand(&self, id: Uuid) -> Result<(), ApiError> {
        delete_by_id(&self.pool, "brands", id).await
    }

    pub async fn list_categories(&self) -> Result<Vec<Category>, ApiError> {
        let rows = sqlx::query(
            "SELECT id, name, slug, parent_id, image_url FROM categories ORDER BY name",
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(category_from_row).collect())
    }

    pub async fn list_categories_paginated(
        &self,
        limit: i64,
        offset: i64,
        search: Option<String>,
    ) -> Result<Vec<Category>, ApiError> {
        let rows = if let Some(search) = search {
            sqlx::query(
                "SELECT id, name, slug, parent_id, image_url FROM categories WHERE name ILIKE $1 OR slug ILIKE $1 ORDER BY name LIMIT $2 OFFSET $3",
            )
            .bind(search)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?
        } else {
            sqlx::query("SELECT id, name, slug, parent_id, image_url FROM categories ORDER BY name LIMIT $1 OFFSET $2")
                .bind(limit)
                .bind(offset)
                .fetch_all(&self.pool)
                .await?
        };

        Ok(rows.into_iter().map(category_from_row).collect())
    }

    pub async fn count_categories(&self, search: Option<String>) -> Result<i64, ApiError> {
        count_named_entities(&self.pool, "categories", search).await
    }

    pub async fn create_category(
        &self,
        payload: &UpsertCategoryRequest,
    ) -> Result<Category, ApiError> {
        let row = sqlx::query(
            r#"
            INSERT INTO categories (name, slug, parent_id, image_url)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, slug, parent_id, image_url
            "#,
        )
        .bind(&payload.name)
        .bind(&payload.slug)
        .bind(payload.parent_id)
        .bind(&payload.image_url)
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
            SET name = $2, slug = $3, parent_id = $4, image_url = $5, updated_at = now()
            WHERE id = $1
            RETURNING id, name, slug, parent_id, image_url
            "#,
        )
        .bind(id)
        .bind(&payload.name)
        .bind(&payload.slug)
        .bind(payload.parent_id)
        .bind(&payload.image_url)
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

async fn list_named_entity_rows(
    pool: &PgPool,
    _table: &'static str,
    search_statement: &'static str,
    list_statement: &'static str,
    limit: i64,
    offset: i64,
    search: Option<String>,
) -> Result<Vec<PgRow>, ApiError> {
    let rows = if let Some(search) = search {
        sqlx::query(search_statement)
            .bind(search)
            .bind(limit)
            .bind(offset)
            .fetch_all(pool)
            .await?
    } else {
        sqlx::query(list_statement)
            .bind(limit)
            .bind(offset)
            .fetch_all(pool)
            .await?
    };

    Ok(rows)
}

async fn count_named_entities(
    pool: &PgPool,
    table: &'static str,
    search: Option<String>,
) -> Result<i64, ApiError> {
    let row = if let Some(search) = search {
        let statement = format!(
            "SELECT COUNT(*)::BIGINT AS total FROM {table} WHERE name ILIKE $1 OR slug ILIKE $1"
        );
        sqlx::query(&statement).bind(search).fetch_one(pool).await?
    } else {
        let statement = format!("SELECT COUNT(*)::BIGINT AS total FROM {table}");
        sqlx::query(&statement).fetch_one(pool).await?
    };

    Ok(row.get("total"))
}

fn book_from_row(row: PgRow) -> Result<Book, ApiError> {
    let categories: serde_json::Value = row.try_get("categories")?;
    let variants: serde_json::Value = row.try_get("variants")?;
    let pricing_rules: serde_json::Value = row.try_get("pricing_rules")?;
    let brand_id: Option<Uuid> = row.try_get("brand_id")?;

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
        brand: brand_id.map(|id| Brand {
            id,
            name: row.try_get("brand_name").unwrap_or_default(),
            slug: row.try_get("brand_slug").unwrap_or_default(),
            logo_url: row.try_get("brand_logo_url").unwrap_or(None),
        }),
        categories: serde_json::from_value(categories)
            .map_err(|error| ApiError::Validation(error.to_string()))?,
        variants: serde_json::from_value(variants)
            .map_err(|error| ApiError::Validation(error.to_string()))?,
        pricing_rules: serde_json::from_value(pricing_rules)
            .map_err(|error| ApiError::Validation(error.to_string()))?,
        price: row.try_get("price")?,
        sale_price: row.try_get("sale_price")?,
        warehouse_price: row.try_get("warehouse_price")?,
        stock: row.try_get("stock")?,
        cover_image_url: row.try_get("cover_image_url")?,
        gallery_image_urls: row.try_get("gallery_image_urls")?,
        tags: row.try_get("tags")?,
        specifications: row.try_get("specifications")?,
        attributes: row.try_get("attributes")?,
        seo_title: row.try_get("seo_title")?,
        seo_description: row.try_get("seo_description")?,
        sku: row.try_get("sku")?,
        barcode: row.try_get("barcode")?,
        dynamic_pricing_enabled: row.try_get("dynamic_pricing_enabled")?,
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

fn brand_from_row(row: PgRow) -> Brand {
    Brand {
        id: row.get("id"),
        name: row.get("name"),
        slug: row.get("slug"),
        logo_url: row.get("logo_url"),
    }
}

fn category_from_row(row: PgRow) -> Category {
    Category {
        id: row.get("id"),
        name: row.get("name"),
        slug: row.get("slug"),
        parent_id: row.get("parent_id"),
        image_url: row.get("image_url"),
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
        b.warehouse_price,
        b.stock,
        b.cover_image_url,
        b.gallery_image_urls,
        b.tags,
        b.specifications,
        b.attributes,
        b.seo_title,
        b.seo_description,
        b.sku,
        b.barcode,
        b.dynamic_pricing_enabled,
        a.id AS author_id,
        a.name AS author_name,
        a.slug AS author_slug,
        p.id AS publisher_id,
        p.name AS publisher_name,
        p.slug AS publisher_slug,
        br.id AS brand_id,
        br.name AS brand_name,
        br.slug AS brand_slug,
        br.logo_url AS brand_logo_url,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'slug', c.slug,
                    'parentId', c.parent_id,
                    'imageUrl', c.image_url
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', pv.id,
                    'bookId', pv.book_id,
                    'sku', pv.sku,
                    'title', pv.title,
                    'attributes', pv.attributes,
                    'price', pv.price,
                    'salePrice', pv.sale_price,
                    'stock', pv.stock,
                    'isActive', pv.is_active
                )
            ) FILTER (WHERE pv.id IS NOT NULL),
            '[]'::jsonb
        ) AS variants,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', pr.id,
                    'bookId', pr.book_id,
                    'name', pr.name,
                    'startsAt', pr.starts_at,
                    'endsAt', pr.ends_at,
                    'discountPercent', pr.discount_percent,
                    'fixedSalePrice', pr.fixed_sale_price,
                    'isActive', pr.is_active
                )
            ) FILTER (WHERE pr.id IS NOT NULL),
            '[]'::jsonb
        ) AS pricing_rules
    FROM books b
    INNER JOIN authors a ON a.id = b.author_id
    INNER JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN brands br ON br.id = b.brand_id
    LEFT JOIN book_categories bc ON bc.book_id = b.id
    LEFT JOIN categories c ON c.id = bc.category_id
    LEFT JOIN product_variants pv ON pv.book_id = b.id
    LEFT JOIN product_pricing_rules pr ON pr.book_id = b.id
    GROUP BY b.id, a.id, p.id, br.id
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
        b.warehouse_price,
        b.stock,
        b.cover_image_url,
        b.gallery_image_urls,
        b.tags,
        b.specifications,
        b.attributes,
        b.seo_title,
        b.seo_description,
        b.sku,
        b.barcode,
        b.dynamic_pricing_enabled,
        a.id AS author_id,
        a.name AS author_name,
        a.slug AS author_slug,
        p.id AS publisher_id,
        p.name AS publisher_name,
        p.slug AS publisher_slug,
        br.id AS brand_id,
        br.name AS brand_name,
        br.slug AS brand_slug,
        br.logo_url AS brand_logo_url,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'slug', c.slug,
                    'parentId', c.parent_id,
                    'imageUrl', c.image_url
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', pv.id,
                    'bookId', pv.book_id,
                    'sku', pv.sku,
                    'title', pv.title,
                    'attributes', pv.attributes,
                    'price', pv.price,
                    'salePrice', pv.sale_price,
                    'stock', pv.stock,
                    'isActive', pv.is_active
                )
            ) FILTER (WHERE pv.id IS NOT NULL),
            '[]'::jsonb
        ) AS variants,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', pr.id,
                    'bookId', pr.book_id,
                    'name', pr.name,
                    'startsAt', pr.starts_at,
                    'endsAt', pr.ends_at,
                    'discountPercent', pr.discount_percent,
                    'fixedSalePrice', pr.fixed_sale_price,
                    'isActive', pr.is_active
                )
            ) FILTER (WHERE pr.id IS NOT NULL),
            '[]'::jsonb
        ) AS pricing_rules
    FROM books b
    INNER JOIN authors a ON a.id = b.author_id
    INNER JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN brands br ON br.id = b.brand_id
    LEFT JOIN book_categories bc ON bc.book_id = b.id
    LEFT JOIN categories c ON c.id = bc.category_id
    LEFT JOIN product_variants pv ON pv.book_id = b.id
    LEFT JOIN product_pricing_rules pr ON pr.book_id = b.id
    WHERE b.title ILIKE $1
       OR b.slug ILIKE $1
       OR a.name ILIKE $1
       OR p.name ILIKE $1
       OR br.name ILIKE $1
    GROUP BY b.id, a.id, p.id, br.id
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
        b.warehouse_price,
        b.stock,
        b.cover_image_url,
        b.gallery_image_urls,
        b.tags,
        b.specifications,
        b.attributes,
        b.seo_title,
        b.seo_description,
        b.sku,
        b.barcode,
        b.dynamic_pricing_enabled,
        a.id AS author_id,
        a.name AS author_name,
        a.slug AS author_slug,
        p.id AS publisher_id,
        p.name AS publisher_name,
        p.slug AS publisher_slug,
        br.id AS brand_id,
        br.name AS brand_name,
        br.slug AS brand_slug,
        br.logo_url AS brand_logo_url,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'slug', c.slug,
                    'parentId', c.parent_id,
                    'imageUrl', c.image_url
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', pv.id,
                    'bookId', pv.book_id,
                    'sku', pv.sku,
                    'title', pv.title,
                    'attributes', pv.attributes,
                    'price', pv.price,
                    'salePrice', pv.sale_price,
                    'stock', pv.stock,
                    'isActive', pv.is_active
                )
            ) FILTER (WHERE pv.id IS NOT NULL),
            '[]'::jsonb
        ) AS variants,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', pr.id,
                    'bookId', pr.book_id,
                    'name', pr.name,
                    'startsAt', pr.starts_at,
                    'endsAt', pr.ends_at,
                    'discountPercent', pr.discount_percent,
                    'fixedSalePrice', pr.fixed_sale_price,
                    'isActive', pr.is_active
                )
            ) FILTER (WHERE pr.id IS NOT NULL),
            '[]'::jsonb
        ) AS pricing_rules
    FROM books b
    INNER JOIN authors a ON a.id = b.author_id
    INNER JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN brands br ON br.id = b.brand_id
    LEFT JOIN book_categories bc ON bc.book_id = b.id
    LEFT JOIN categories c ON c.id = bc.category_id
    LEFT JOIN product_variants pv ON pv.book_id = b.id
    LEFT JOIN product_pricing_rules pr ON pr.book_id = b.id
    WHERE b.id = $1
    GROUP BY b.id, a.id, p.id, br.id
"#;

const BOOK_BY_SLUG: &str = r#"
    SELECT
        b.id,
        b.title,
        b.slug,
        b.description,
        b.price,
        b.sale_price,
        b.warehouse_price,
        b.stock,
        b.cover_image_url,
        b.gallery_image_urls,
        b.tags,
        b.specifications,
        b.attributes,
        b.seo_title,
        b.seo_description,
        b.sku,
        b.barcode,
        b.dynamic_pricing_enabled,
        a.id AS author_id,
        a.name AS author_name,
        a.slug AS author_slug,
        p.id AS publisher_id,
        p.name AS publisher_name,
        p.slug AS publisher_slug,
        br.id AS brand_id,
        br.name AS brand_name,
        br.slug AS brand_slug,
        br.logo_url AS brand_logo_url,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'slug', c.slug,
                    'parentId', c.parent_id,
                    'imageUrl', c.image_url
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', pv.id,
                    'bookId', pv.book_id,
                    'sku', pv.sku,
                    'title', pv.title,
                    'attributes', pv.attributes,
                    'price', pv.price,
                    'salePrice', pv.sale_price,
                    'stock', pv.stock,
                    'isActive', pv.is_active
                )
            ) FILTER (WHERE pv.id IS NOT NULL),
            '[]'::jsonb
        ) AS variants,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', pr.id,
                    'bookId', pr.book_id,
                    'name', pr.name,
                    'startsAt', pr.starts_at,
                    'endsAt', pr.ends_at,
                    'discountPercent', pr.discount_percent,
                    'fixedSalePrice', pr.fixed_sale_price,
                    'isActive', pr.is_active
                )
            ) FILTER (WHERE pr.id IS NOT NULL),
            '[]'::jsonb
        ) AS pricing_rules
    FROM books b
    INNER JOIN authors a ON a.id = b.author_id
    INNER JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN brands br ON br.id = b.brand_id
    LEFT JOIN book_categories bc ON bc.book_id = b.id
    LEFT JOIN categories c ON c.id = bc.category_id
    LEFT JOIN product_variants pv ON pv.book_id = b.id
    LEFT JOIN product_pricing_rules pr ON pr.book_id = b.id
    WHERE b.slug = $1
    GROUP BY b.id, a.id, p.id, br.id
"#;
