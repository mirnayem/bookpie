mod cache;
mod config;
mod db;
mod error;
mod middleware;
mod models;
mod modules;
mod repositories;
mod response;
mod routes;
mod services;
mod state;

use std::net::SocketAddr;

use axum::serve;
use config::Config;
use state::AppState;
use tokio::net::TcpListener;
use tracing::info;
use tracing_subscriber::{EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), error::ApiError> {
    init_tracing();

    let config = Config::from_env()?;
    let state = AppState::new(config.clone())?;
    let app = routes::build_router(state);
    let addr = SocketAddr::from((config.api_host, config.api_port));
    let listener = TcpListener::bind(addr).await?;

    info!(%addr, "bookpie api listening");

    serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

fn init_tracing() {
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("api=debug,tower_http=info"));

    tracing_subscriber::registry()
        .with(env_filter)
        .with(tracing_subscriber::fmt::layer().json())
        .init();
}

async fn shutdown_signal() {
    let ctrl_c = async {
        if let Err(error) = tokio::signal::ctrl_c().await {
            tracing::error!(%error, "failed to install ctrl+c handler");
        }
    };

    #[cfg(unix)]
    let terminate = async {
        match tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate()) {
            Ok(mut signal) => {
                signal.recv().await;
            }
            Err(error) => tracing::error!(%error, "failed to install terminate handler"),
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        () = ctrl_c => {},
        () = terminate => {},
    }
}
