use axum::{
    Json, Router,
    extract::{Path, Query, State},
    routing::{get, patch, post},
};
use uuid::Uuid;

use crate::{
    error::ApiError, middleware::auth::CurrentUser, response::ApiResponse, state::AppState,
};

use super::{
    model::{
        Author, Book, Brand, Category, ListQuery, Publisher, UpsertAuthorRequest,
        UpsertBookRequest, UpsertBrandRequest, UpsertCategoryRequest, UpsertPublisherRequest,
    },
    service::CatalogService,
};
use crate::modules::search::{model::BookSearchDocument, service::SearchService};

pub fn catalog_router() -> Router<AppState> {
    Router::new()
        .route("/books", get(list_books))
        .route("/books/{slug}", get(book_details))
        .route("/authors", get(list_authors))
        .route("/publishers", get(list_publishers))
        .route("/brands", get(list_brands))
        .route("/categories", get(list_categories))
        .route("/admin/books", post(create_book))
        .route("/admin/books/{id}", patch(update_book).delete(delete_book))
        .route("/admin/authors", post(create_author))
        .route(
            "/admin/authors/{id}",
            patch(update_author).delete(delete_author),
        )
        .route("/admin/publishers", post(create_publisher))
        .route(
            "/admin/publishers/{id}",
            patch(update_publisher).delete(delete_publisher),
        )
        .route("/admin/brands", post(create_brand))
        .route(
            "/admin/brands/{id}",
            patch(update_brand).delete(delete_brand),
        )
        .route("/admin/categories", post(create_category))
        .route(
            "/admin/categories/{id}",
            patch(update_category).delete(delete_category),
        )
}

async fn list_books(
    State(state): State<AppState>,
    Query(query): Query<ListQuery>,
) -> Result<Json<ApiResponse<Vec<Book>>>, ApiError> {
    let service = CatalogService::new(state.pg_pool.clone());
    let books = service.list_books(query).await?;

    Ok(Json(ApiResponse::ok(books)))
}

async fn book_details(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<Json<ApiResponse<Book>>, ApiError> {
    let service = CatalogService::new(state.pg_pool.clone());
    let book = service.book_details(&slug).await?;

    Ok(Json(ApiResponse::ok(book)))
}

async fn create_book(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertBookRequest>,
) -> Result<Json<ApiResponse<Book>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    let book = service.create_book(payload).await?;
    sync_book_to_search(&state, book.clone()).await;

    Ok(Json(ApiResponse::ok(book)))
}

async fn update_book(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpsertBookRequest>,
) -> Result<Json<ApiResponse<Book>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    let book = service.update_book(id, payload).await?;
    sync_book_to_search(&state, book.clone()).await;

    Ok(Json(ApiResponse::ok(book)))
}

async fn delete_book(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    service.delete_book(id).await?;
    delete_book_from_search(&state, id).await;

    Ok(Json(ApiResponse::ok(())))
}

async fn list_authors(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<Author>>>, ApiError> {
    let service = CatalogService::new(state.pg_pool.clone());
    let authors = service.list_authors().await?;

    Ok(Json(ApiResponse::ok(authors)))
}

async fn create_author(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertAuthorRequest>,
) -> Result<Json<ApiResponse<Author>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    let author = service.create_author(payload).await?;

    Ok(Json(ApiResponse::ok(author)))
}

async fn update_author(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpsertAuthorRequest>,
) -> Result<Json<ApiResponse<Author>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    let author = service.update_author(id, payload).await?;

    Ok(Json(ApiResponse::ok(author)))
}

async fn delete_author(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    service.delete_author(id).await?;

    Ok(Json(ApiResponse::ok(())))
}

async fn list_publishers(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<Publisher>>>, ApiError> {
    let service = CatalogService::new(state.pg_pool.clone());
    let publishers = service.list_publishers().await?;

    Ok(Json(ApiResponse::ok(publishers)))
}

async fn create_publisher(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertPublisherRequest>,
) -> Result<Json<ApiResponse<Publisher>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    let publisher = service.create_publisher(payload).await?;

    Ok(Json(ApiResponse::ok(publisher)))
}

async fn update_publisher(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpsertPublisherRequest>,
) -> Result<Json<ApiResponse<Publisher>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    let publisher = service.update_publisher(id, payload).await?;

    Ok(Json(ApiResponse::ok(publisher)))
}

async fn delete_publisher(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    service.delete_publisher(id).await?;

    Ok(Json(ApiResponse::ok(())))
}

async fn list_brands(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<Brand>>>, ApiError> {
    let service = CatalogService::new(state.pg_pool.clone());
    let brands = service.list_brands().await?;

    Ok(Json(ApiResponse::ok(brands)))
}

async fn create_brand(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertBrandRequest>,
) -> Result<Json<ApiResponse<Brand>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    let brand = service.create_brand(payload).await?;

    Ok(Json(ApiResponse::ok(brand)))
}

async fn update_brand(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpsertBrandRequest>,
) -> Result<Json<ApiResponse<Brand>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    let brand = service.update_brand(id, payload).await?;

    Ok(Json(ApiResponse::ok(brand)))
}

async fn delete_brand(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    service.delete_brand(id).await?;

    Ok(Json(ApiResponse::ok(())))
}

async fn list_categories(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<Category>>>, ApiError> {
    let service = CatalogService::new(state.pg_pool.clone());
    let categories = service.list_categories().await?;

    Ok(Json(ApiResponse::ok(categories)))
}

async fn create_category(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertCategoryRequest>,
) -> Result<Json<ApiResponse<Category>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    let category = service.create_category(payload).await?;

    Ok(Json(ApiResponse::ok(category)))
}

async fn update_category(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpsertCategoryRequest>,
) -> Result<Json<ApiResponse<Category>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    let category = service.update_category(id, payload).await?;

    Ok(Json(ApiResponse::ok(category)))
}

async fn delete_category(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, ApiError> {
    user.require_admin()?;

    let service = CatalogService::new(state.pg_pool.clone());
    service.delete_category(id).await?;

    Ok(Json(ApiResponse::ok(())))
}

async fn sync_book_to_search(state: &AppState, book: Book) {
    let search_service = SearchService::new(state.http_client.clone(), state.config.clone());

    if let Err(error) = search_service
        .index_book(BookSearchDocument::from(book))
        .await
    {
        tracing::warn!(error = %error, "failed to index book in Meilisearch");
    }
}

async fn delete_book_from_search(state: &AppState, id: Uuid) {
    let search_service = SearchService::new(state.http_client.clone(), state.config.clone());

    if let Err(error) = search_service.delete_book(id).await {
        tracing::warn!(error = %error, "failed to delete book from Meilisearch");
    }
}
