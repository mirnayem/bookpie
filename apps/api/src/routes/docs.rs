use axum::{Json, Router, response::Html, routing::get};
use serde_json::{Value, json};

use crate::state::AppState;

pub fn docs_router() -> Router<AppState> {
    Router::new()
        .route("/openapi.json", get(openapi))
        .route("/docs", get(swagger_ui))
}

async fn openapi() -> Json<Value> {
    Json(json!({
        "openapi": "3.1.0",
        "info": {
            "title": "BookPie API",
            "version": "1.0.0"
        },
        "servers": [{ "url": "/api/v1" }],
        "paths": {
            "/auth/login": { "post": { "summary": "Customer/admin login" } },
            "/mobile/auth/login": { "post": { "summary": "Mobile login" } },
            "/books": { "get": { "summary": "List books" } },
            "/books/{slug}": { "get": { "summary": "Book details" } },
            "/cart": { "get": { "summary": "Current user cart" } },
            "/orders": { "get": { "summary": "Current user orders" }, "post": { "summary": "Create order from cart" } },
            "/admin/books": { "post": { "summary": "Create book" } },
            "/admin/orders": { "get": { "summary": "Admin order list" } },
            "/admin/analytics/dashboard": { "get": { "summary": "Admin dashboard metrics" } }
        },
        "components": {
            "securitySchemes": {
                "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" }
            }
        }
    }))
}

async fn swagger_ui() -> Html<&'static str> {
    Html(
        r##"<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>BookPie API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>SwaggerUIBundle({ url: "/openapi.json", dom_id: "#swagger-ui" });</script>
</body>
</html>"##,
    )
}
