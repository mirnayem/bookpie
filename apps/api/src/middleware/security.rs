use axum::{
    body::Body,
    extract::State,
    http::{HeaderMap, HeaderValue, Method, Request, StatusCode, header},
    middleware::Next,
    response::Response,
};
use redis::AsyncCommands;

use crate::{error::ApiError, state::AppState};

const RATE_LIMIT_PER_MINUTE: i64 = 120;

pub async fn security_middleware(
    State(state): State<AppState>,
    request: Request<Body>,
    next: Next,
) -> Result<Response, ApiError> {
    enforce_csrf(request.method(), request.headers())?;
    enforce_rate_limit(&state, request.headers()).await?;

    let method = request.method().clone();
    let path = request.uri().path().to_string();
    let ip_address = header_text(request.headers(), "x-forwarded-for")
        .or_else(|| header_text(request.headers(), "x-real-ip"));
    let user_agent = header_text(request.headers(), "user-agent");

    let mut response = next.run(request).await;
    add_security_headers(response.headers_mut());

    if is_mutating_method(&method) && path.starts_with("/api/v1/admin") {
        audit_admin_action(&state, &method, &path, response.status(), ip_address, user_agent).await;
    }

    Ok(response)
}

fn enforce_csrf(method: &Method, headers: &HeaderMap) -> Result<(), ApiError> {
    if !is_mutating_method(method) {
        return Ok(());
    }

    let uses_bearer = headers
        .get(header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .is_some_and(|value| value.starts_with("Bearer "));

    if uses_bearer || !headers.contains_key(header::COOKIE) {
        return Ok(());
    }

    let token = headers
        .get("x-csrf-token")
        .and_then(|value| value.to_str().ok())
        .unwrap_or_default();

    if token == "bookpie-csrf" {
        Ok(())
    } else {
        Err(ApiError::Forbidden)
    }
}

async fn enforce_rate_limit(state: &AppState, headers: &HeaderMap) -> Result<(), ApiError> {
    let key = format!(
        "rate-limit:{}",
        header_text(headers, "x-forwarded-for")
            .or_else(|| header_text(headers, "x-real-ip"))
            .unwrap_or_else(|| "local".to_string())
    );

    let Ok(mut connection) = state.redis_client.get_multiplexed_async_connection().await else {
        tracing::warn!("redis unavailable; skipping rate limit");
        return Ok(());
    };

    let count: i64 = connection.incr(&key, 1).await?;
    if count == 1 {
        let _: bool = connection.expire(&key, 60).await?;
    }

    if count > RATE_LIMIT_PER_MINUTE {
        Err(ApiError::RateLimited)
    } else {
        Ok(())
    }
}

fn add_security_headers(headers: &mut HeaderMap) {
    headers.insert("x-content-type-options", HeaderValue::from_static("nosniff"));
    headers.insert("x-frame-options", HeaderValue::from_static("DENY"));
    headers.insert("referrer-policy", HeaderValue::from_static("strict-origin-when-cross-origin"));
    headers.insert(
        "content-security-policy",
        HeaderValue::from_static("default-src 'self'; frame-ancestors 'none'"),
    );
}

async fn audit_admin_action(
    state: &AppState,
    method: &Method,
    path: &str,
    status: StatusCode,
    ip_address: Option<String>,
    user_agent: Option<String>,
) {
    if let Err(error) = sqlx::query(
        r#"
        INSERT INTO audit_logs (method, path, status_code, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind(method.as_str())
    .bind(path)
    .bind(i32::from(status.as_u16()))
    .bind(ip_address)
    .bind(user_agent)
    .execute(&state.pg_pool)
    .await
    {
        tracing::warn!(%error, "failed to write audit log");
    }
}

fn is_mutating_method(method: &Method) -> bool {
    matches!(*method, Method::POST | Method::PUT | Method::PATCH | Method::DELETE)
}

fn header_text(headers: &HeaderMap, name: &str) -> Option<String> {
    headers
        .get(name)
        .and_then(|value| value.to_str().ok())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
}
