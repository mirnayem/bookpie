use axum::{
    Json, Router,
    extract::{Query, State},
    routing::{get, post},
};

use crate::{
    error::ApiError, middleware::auth::CurrentUser, modules::books::service::CatalogService,
    response::ApiResponse, state::AppState,
};

use super::{
    model::{
        AutocompleteQuery, AutocompleteSuggestion, BookSearchDocument, ReindexResult, SearchQuery,
        SearchResult,
    },
    service::SearchService,
};

pub fn search_router() -> Router<AppState> {
    Router::new()
        .route("/search/books", get(search_books))
        .route("/search/autocomplete", get(autocomplete))
        .route("/admin/search/reindex/books", post(reindex_books))
}

async fn search_books(
    State(state): State<AppState>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<ApiResponse<SearchResult>>, ApiError> {
    let service = SearchService::new(state.http_client.clone(), state.config.clone());
    let result = service
        .search_books(&query.q, query.limit(), query.offset())
        .await?;
    log_search_event(&state, &result.query, result.estimated_total_hits).await;

    Ok(Json(ApiResponse::ok(result)))
}

async fn autocomplete(
    State(state): State<AppState>,
    Query(query): Query<AutocompleteQuery>,
) -> Result<Json<ApiResponse<Vec<AutocompleteSuggestion>>>, ApiError> {
    let service = SearchService::new(state.http_client.clone(), state.config.clone());
    let suggestions = service.autocomplete(&query.q, query.limit()).await?;

    Ok(Json(ApiResponse::ok(suggestions)))
}

async fn reindex_books(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<ReindexResult>>, ApiError> {
    user.require_admin()?;

    let catalog_service = CatalogService::new(state.pg_pool.clone());
    let search_service = SearchService::new(state.http_client.clone(), state.config.clone());
    let books = catalog_service
        .list_books_for_index()
        .await?
        .into_iter()
        .map(BookSearchDocument::from)
        .collect();
    let result = search_service.reindex_books(books).await?;

    Ok(Json(ApiResponse::ok(result)))
}

async fn log_search_event(state: &AppState, query: &str, result_count: usize) {
    if let Err(error) = sqlx::query(
        r#"
        INSERT INTO search_events (query, normalized_query, result_count, source)
        VALUES ($1, $2, $3, 'web')
        "#,
    )
    .bind(query)
    .bind(query.trim().to_lowercase())
    .bind(i32::try_from(result_count).unwrap_or(i32::MAX))
    .execute(&state.pg_pool)
    .await
    {
        tracing::warn!(error = %error, "failed to record search analytics event");
    }
}
