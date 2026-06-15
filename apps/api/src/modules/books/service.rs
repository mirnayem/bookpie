use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::error::ApiError;

use super::{
    model::{
        Author, Book, Category, ListQuery, Publisher, UpsertAuthorRequest, UpsertBookRequest,
        UpsertCategoryRequest, UpsertPublisherRequest,
    },
    repository::CatalogRepository,
};

#[derive(Clone)]
pub struct CatalogService {
    repository: CatalogRepository,
}

impl CatalogService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: CatalogRepository::new(pool),
        }
    }

    pub async fn list_books(&self, query: ListQuery) -> Result<Vec<Book>, ApiError> {
        self.repository
            .list_books(query.limit(), query.offset())
            .await
    }

    pub async fn list_books_for_index(&self) -> Result<Vec<Book>, ApiError> {
        self.repository.list_books(10_000, 0).await
    }

    pub async fn book_details(&self, slug: &str) -> Result<Book, ApiError> {
        self.repository
            .find_book_by_slug(slug)
            .await?
            .ok_or(ApiError::NotFound)
    }

    pub async fn create_book(&self, payload: UpsertBookRequest) -> Result<Book, ApiError> {
        validate_book_payload(&payload)?;
        self.repository
            .create_book(&payload)
            .await
            .map_err(map_database_error)
    }

    pub async fn update_book(
        &self,
        id: Uuid,
        payload: UpsertBookRequest,
    ) -> Result<Book, ApiError> {
        validate_book_payload(&payload)?;
        self.repository
            .update_book(id, &payload)
            .await
            .map_err(map_database_error)
    }

    pub async fn delete_book(&self, id: Uuid) -> Result<(), ApiError> {
        self.repository.delete_book(id).await
    }

    pub async fn list_authors(&self) -> Result<Vec<Author>, ApiError> {
        self.repository.list_authors().await
    }

    pub async fn create_author(&self, payload: UpsertAuthorRequest) -> Result<Author, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .create_author(&payload)
            .await
            .map_err(map_database_error)
    }

    pub async fn update_author(
        &self,
        id: Uuid,
        payload: UpsertAuthorRequest,
    ) -> Result<Author, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .update_author(id, &payload)
            .await
            .map_err(map_database_error)
    }

    pub async fn delete_author(&self, id: Uuid) -> Result<(), ApiError> {
        self.repository.delete_author(id).await
    }

    pub async fn list_publishers(&self) -> Result<Vec<Publisher>, ApiError> {
        self.repository.list_publishers().await
    }

    pub async fn create_publisher(
        &self,
        payload: UpsertPublisherRequest,
    ) -> Result<Publisher, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .create_publisher(&payload)
            .await
            .map_err(map_database_error)
    }

    pub async fn update_publisher(
        &self,
        id: Uuid,
        payload: UpsertPublisherRequest,
    ) -> Result<Publisher, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .update_publisher(id, &payload)
            .await
            .map_err(map_database_error)
    }

    pub async fn delete_publisher(&self, id: Uuid) -> Result<(), ApiError> {
        self.repository.delete_publisher(id).await
    }

    pub async fn list_categories(&self) -> Result<Vec<Category>, ApiError> {
        self.repository.list_categories().await
    }

    pub async fn create_category(
        &self,
        payload: UpsertCategoryRequest,
    ) -> Result<Category, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .create_category(&payload)
            .await
            .map_err(map_database_error)
    }

    pub async fn update_category(
        &self,
        id: Uuid,
        payload: UpsertCategoryRequest,
    ) -> Result<Category, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .update_category(id, &payload)
            .await
            .map_err(map_database_error)
    }

    pub async fn delete_category(&self, id: Uuid) -> Result<(), ApiError> {
        self.repository.delete_category(id).await
    }
}

fn validate_book_payload(payload: &UpsertBookRequest) -> Result<(), ApiError> {
    payload
        .validate()
        .map_err(|error| ApiError::Validation(error.to_string()))?;

    if payload.sale_price > payload.price {
        return Err(ApiError::Validation(
            "salePrice must be less than or equal to price".to_string(),
        ));
    }

    Ok(())
}

fn map_database_error(error: ApiError) -> ApiError {
    match &error {
        ApiError::Sqlx(sqlx::Error::Database(database_error))
            if database_error.code().as_deref() == Some("23505") =>
        {
            ApiError::Conflict("slug already exists".to_string())
        }
        ApiError::Sqlx(sqlx::Error::Database(database_error))
            if database_error.code().as_deref() == Some("23503") =>
        {
            ApiError::Validation("referenced catalog record does not exist".to_string())
        }
        _ => error,
    }
}
