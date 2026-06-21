use std::{collections::HashMap, env, fs, net::IpAddr, path::Path};

use crate::error::ApiError;

#[derive(Clone, Debug)]
pub struct Config {
    pub app_env: String,
    pub api_host: IpAddr,
    pub api_port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub meili_url: String,
    pub meili_api_key: Option<String>,
    pub meili_books_index: String,
    pub jwt_secret: String,
    pub jwt_issuer: String,
    pub cors_origins: Vec<String>,
}

impl Config {
    pub fn from_env() -> Result<Self, ApiError> {
        let env_source = EnvSource::load();
        let app_env = env_source.string("APP_ENV", "development");
        let env_source = env_source.with_env_file(&app_env);

        Ok(Self {
            app_env,
            api_host: env_source.string("API_HOST", "127.0.0.1").parse()?,
            api_port: env_source.string("API_PORT", "4000").parse()?,
            database_url: env_source.required("DATABASE_URL")?,
            redis_url: env_source.string("REDIS_URL", "redis://127.0.0.1:6379"),
            meili_url: env_source.string("MEILI_URL", "http://127.0.0.1:7700"),
            meili_api_key: env_source.optional("MEILI_API_KEY"),
            meili_books_index: env_source.string("MEILI_BOOKS_INDEX", "books"),
            jwt_secret: env_source.required("JWT_SECRET")?,
            jwt_issuer: env_source.string("JWT_ISSUER", "bookpie-api"),
            cors_origins: env_source
                .string("CORS_ORIGINS", "http://localhost:3000")
                .split(',')
                .map(str::trim)
                .filter(|origin| !origin.is_empty())
                .map(ToOwned::to_owned)
                .collect(),
        })
    }
}

#[derive(Default)]
struct EnvSource {
    file_values: HashMap<String, String>,
}

impl EnvSource {
    fn load() -> Self {
        let mut source = Self::default();
        source.load_file(".env");
        source.load_file("apps/api/.env");
        source
    }

    fn with_env_file(mut self, app_env: &str) -> Self {
        self.load_file(format!("config/env/{app_env}.env"));
        self
    }

    fn required(&self, key: &str) -> Result<String, ApiError> {
        self.value(key)
            .ok_or_else(|| ApiError::Config(format!("{key} is required")))
    }

    fn string(&self, key: &str, fallback: &str) -> String {
        self.value(key).unwrap_or_else(|| fallback.to_owned())
    }

    fn optional(&self, key: &str) -> Option<String> {
        self.value(key)
            .map(|value| value.trim().to_owned())
            .filter(|value| !value.is_empty())
    }

    fn value(&self, key: &str) -> Option<String> {
        env::var(key)
            .ok()
            .or_else(|| self.file_values.get(key).cloned())
    }

    fn load_file(&mut self, path: impl AsRef<Path>) {
        let Ok(contents) = fs::read_to_string(path) else {
            return;
        };

        for line in contents.lines() {
            let line = line.trim();

            if line.is_empty() || line.starts_with('#') {
                continue;
            }

            let Some((key, value)) = line.split_once('=') else {
                continue;
            };
            let key = key.trim().strip_prefix("export ").unwrap_or(key.trim());

            if key.is_empty() {
                continue;
            }

            self.file_values
                .insert(key.to_owned(), normalize_env_value(value));
        }
    }
}

fn normalize_env_value(value: &str) -> String {
    let value = value.trim();

    if let Some(unquoted) = value
        .strip_prefix('"')
        .and_then(|value| value.strip_suffix('"'))
    {
        return unquoted.to_owned();
    }

    if let Some(unquoted) = value
        .strip_prefix('\'')
        .and_then(|value| value.strip_suffix('\''))
    {
        return unquoted.to_owned();
    }

    value.to_owned()
}
