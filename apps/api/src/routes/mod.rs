use axum::{Router, routing::get};
use tower_http::{cors::CorsLayer, trace::TraceLayer};

use crate::{
    middleware,
    modules::{auth::controller::auth_router, books::controller::catalog_router},
    routes::health::health_router,
    state::AppState,
};

mod health;

pub fn build_router(state: AppState) -> Router {
    Router::new()
        .route("/", get(root))
        .nest("/health", health_router())
        .nest("/api/v1/auth", auth_router())
        .nest("/api/v1", catalog_router())
        .nest("/api/v1", protected_router())
        .layer(cors_layer(&state))
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}

async fn root() -> &'static str {
    "BookPie API"
}

fn protected_router() -> Router<AppState> {
    Router::new()
        .route("/me", get(middleware::auth::me))
        .route("/admin/ping", get(middleware::auth::admin_ping))
}

fn cors_layer(state: &AppState) -> CorsLayer {
    use axum::http::{HeaderValue, Method, header};

    let origins = state
        .config
        .cors_origins
        .iter()
        .filter_map(|origin| origin.parse::<HeaderValue>().ok())
        .collect::<Vec<_>>();

    CorsLayer::new()
        .allow_origin(origins)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
        ])
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
}
