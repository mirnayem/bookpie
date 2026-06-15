use argon2::{
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    password_hash::{SaltString, rand_core::OsRng},
};
use chrono::{Duration, Utc};
use jsonwebtoken::{Algorithm, EncodingKey, Header, encode};
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::{
    error::ApiError,
    middleware::auth::{Claims, UserRole},
    modules::auth::{
        model::{
            AuthResponse, AuthUser, LoginRequest, RefreshTokenRequest, RegisterRequest, TokenPair,
            UserRecord,
        },
        repository::AuthRepository,
    },
    state::AppState,
};

#[derive(Clone)]
pub struct AuthService {
    repository: AuthRepository,
    state: AppState,
}

impl AuthService {
    pub fn new(state: AppState) -> Self {
        Self {
            repository: AuthRepository::new(state.pg_pool.clone()),
            state,
        }
    }

    pub async fn register(&self, payload: RegisterRequest) -> Result<AuthResponse, ApiError> {
        if self
            .repository
            .find_user_by_email(&payload.email)
            .await?
            .is_some()
        {
            return Err(ApiError::Conflict("email is already registered".to_owned()));
        }

        let password_hash = hash_password(&payload.password)?;
        let user = self
            .repository
            .create_user(&payload, &password_hash)
            .await?;
        self.auth_response(user).await
    }

    pub async fn login(&self, payload: LoginRequest) -> Result<AuthResponse, ApiError> {
        let user = self
            .repository
            .find_user_by_email(&payload.email)
            .await?
            .ok_or(ApiError::Unauthorized)?;

        verify_password(&payload.password, &user.password_hash)?;
        self.auth_response(user).await
    }

    pub async fn refresh(&self, payload: RefreshTokenRequest) -> Result<AuthResponse, ApiError> {
        let token_hash = hash_refresh_token(&payload.refresh_token);
        let user_id = self
            .repository
            .find_active_refresh_user_id(&token_hash)
            .await?
            .ok_or(ApiError::Unauthorized)?;

        self.repository.revoke_refresh_token(&token_hash).await?;

        let user = self
            .repository
            .find_user_by_id(user_id)
            .await?
            .ok_or(ApiError::NotFound)?;

        self.auth_response(user).await
    }

    async fn auth_response(&self, user: UserRecord) -> Result<AuthResponse, ApiError> {
        let tokens = self.issue_tokens(user.id, user.role.clone()).await?;

        Ok(AuthResponse {
            user: AuthUser::from(user),
            tokens,
        })
    }

    async fn issue_tokens(&self, user_id: Uuid, role: UserRole) -> Result<TokenPair, ApiError> {
        let access_token = encode_access_token(&self.state, user_id, role)?;
        let refresh_token = new_refresh_token();
        let refresh_token_hash = hash_refresh_token(&refresh_token);
        let expires_at = Utc::now() + Duration::days(30);

        self.repository
            .store_refresh_token(user_id, &refresh_token_hash, expires_at)
            .await?;

        Ok(TokenPair {
            access_token,
            refresh_token,
        })
    }
}

fn hash_password(password: &str) -> Result<String, ApiError> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|error| ApiError::Config(format!("failed to hash password: {error}")))?;

    Ok(hash.to_string())
}

fn verify_password(password: &str, password_hash: &str) -> Result<(), ApiError> {
    let parsed_hash = PasswordHash::new(password_hash).map_err(|_| ApiError::Unauthorized)?;

    Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .map_err(|_| ApiError::Unauthorized)
}

fn encode_access_token(
    state: &AppState,
    user_id: Uuid,
    role: UserRole,
) -> Result<String, ApiError> {
    let claims = Claims {
        sub: user_id,
        role,
        exp: (Utc::now() + Duration::minutes(30)).timestamp(),
        iss: state.config.jwt_issuer.clone(),
    };

    Ok(encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(state.config.jwt_secret.as_bytes()),
    )?)
}

fn new_refresh_token() -> String {
    format!("{}.{}", Uuid::new_v4(), Uuid::new_v4())
}

fn hash_refresh_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}
