use axum::{Router, middleware::from_fn_with_state, routing::get};
use tower_http::{cors::CorsLayer, trace::TraceLayer};

use crate::{
    middleware,
    modules::{
        admin::controller::admin_router, auth::controller::{auth_router, mobile_auth_router},
        analytics::controller::analytics_router,
        books::controller::catalog_router, carts::controller::cart_router,
        delivery::controller::delivery_router, inventory::controller::inventory_router,
        notifications::controller::notification_router, orders::controller::order_router,
        profiles::controller::profile_router, promotions::controller::promotion_router,
        reviews::controller::review_router,
        search::controller::search_router,
    },
    routes::health::health_router,
    state::AppState,
};

mod health;
mod docs;

pub fn build_router(state: AppState) -> Router {
    Router::new()
        .route("/", get(root))
        .nest("/health", health_router())
        .merge(docs::docs_router())
        .nest("/api/v1/auth", auth_router())
        .nest("/api/v1/mobile/auth", mobile_auth_router())
        .nest("/api/v1", catalog_router())
        .nest("/api/v1", search_router())
        .nest("/api/v1", cart_router())
        .nest("/api/v1", profile_router())
        .nest("/api/v1", promotion_router())
        .nest("/api/v1", notification_router())
        .nest("/api/v1", review_router())
        .nest("/api/v1", inventory_router())
        .nest("/api/v1", delivery_router())
        .nest("/api/v1", order_router())
        .nest("/api/v1", admin_router())
        .nest("/api/v1", analytics_router())
        .nest("/api/v1", protected_router())
        .layer(from_fn_with_state(
            state.clone(),
            middleware::security::security_middleware,
        ))
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
