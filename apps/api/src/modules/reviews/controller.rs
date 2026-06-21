use axum::{
    Json, Router,
    extract::{Path, Query, State},
    routing::{get, patch},
};
use uuid::Uuid;

use crate::{
    error::ApiError, middleware::auth::CurrentUser, response::ApiResponse, state::AppState,
};

use super::{
    model::{
        CreateReviewRequest, ModerateReviewRequest, ProductRatingSummary, ProductReview,
        ReviewListQuery,
    },
    service::ReviewService,
};

pub fn review_router() -> Router<AppState> {
    Router::new()
        .route("/books/{book_id}/reviews", get(list_reviews).post(create_review))
        .route("/books/{book_id}/ratings", get(rating_summary))
        .route("/admin/reviews", get(admin_reviews))
        .route("/admin/reviews/{id}/moderation", patch(moderate_review))
}

async fn list_reviews(
    State(state): State<AppState>,
    Path(book_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Vec<ProductReview>>>, ApiError> {
    let service = ReviewService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.list_for_book(book_id).await?)))
}

async fn rating_summary(
    State(state): State<AppState>,
    Path(book_id): Path<Uuid>,
) -> Result<Json<ApiResponse<ProductRatingSummary>>, ApiError> {
    let service = ReviewService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.rating_summary(book_id).await?)))
}

async fn create_review(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(book_id): Path<Uuid>,
    Json(payload): Json<CreateReviewRequest>,
) -> Result<Json<ApiResponse<ProductReview>>, ApiError> {
    let service = ReviewService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.create(book_id, user.id, payload).await?,
    )))
}

async fn admin_reviews(
    State(state): State<AppState>,
    user: CurrentUser,
    Query(query): Query<ReviewListQuery>,
) -> Result<Json<ApiResponse<Vec<ProductReview>>>, ApiError> {
    user.require_admin()?;
    let service = ReviewService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.admin_list(query).await?)))
}

async fn moderate_review(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<ModerateReviewRequest>,
) -> Result<Json<ApiResponse<ProductReview>>, ApiError> {
    user.require_admin()?;
    let service = ReviewService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.moderate(id, user.id, payload).await?,
    )))
}
