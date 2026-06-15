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
            AuthResponse, AuthUser, LoginRequest, LogoutRequest, OtpRequest, OtpResponse,
            PasswordResetConfirmRequest, PasswordResetRequest, PasswordResetResponse,
            RefreshTokenRequest, RegisterRequest, TokenPair, UserRecord, VerificationResponse,
            VerifyOtpRequest,
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

    pub async fn logout(&self, payload: LogoutRequest) -> Result<(), ApiError> {
        let token_hash = hash_refresh_token(&payload.refresh_token);
        self.repository.revoke_refresh_token(&token_hash).await
    }

    pub async fn request_password_reset(
        &self,
        payload: PasswordResetRequest,
    ) -> Result<PasswordResetResponse, ApiError> {
        let token = new_refresh_token();

        if let Some(user) = self.repository.find_user_by_email(&payload.email).await? {
            let token_hash = hash_refresh_token(&token);
            let expires_at = Utc::now() + Duration::minutes(30);
            self.repository
                .store_password_reset_token(user.id, &token_hash, expires_at)
                .await?;
        }

        Ok(PasswordResetResponse {
            reset_token: self.mock_secret(token),
        })
    }

    pub async fn confirm_password_reset(
        &self,
        payload: PasswordResetConfirmRequest,
    ) -> Result<(), ApiError> {
        let token_hash = hash_refresh_token(&payload.token);
        let user_id = self
            .repository
            .consume_password_reset_token(&token_hash)
            .await?
            .ok_or(ApiError::Unauthorized)?;
        let password_hash = hash_password(&payload.password)?;

        self.repository
            .update_password(user_id, &password_hash)
            .await?;
        self.repository.revoke_all_refresh_tokens(user_id).await
    }

    pub async fn request_otp(&self, payload: OtpRequest) -> Result<OtpResponse, ApiError> {
        let user = self
            .repository
            .find_user_by_email(&payload.email)
            .await?
            .ok_or(ApiError::NotFound)?;
        let code = new_otp_code(user.id, payload.purpose.as_str());
        let code_hash = hash_refresh_token(&code);
        let expires_at = Utc::now() + Duration::minutes(10);

        self.repository
            .store_otp(
                user.id,
                &payload.purpose,
                payload.email.trim(),
                &code_hash,
                expires_at,
            )
            .await?;

        Ok(OtpResponse {
            otp_code: self.mock_secret(code),
        })
    }

    pub async fn verify_otp(
        &self,
        payload: VerifyOtpRequest,
    ) -> Result<VerificationResponse, ApiError> {
        let user = self
            .repository
            .find_user_by_email(&payload.email)
            .await?
            .ok_or(ApiError::NotFound)?;
        let code_hash = hash_refresh_token(&payload.code);
        let verified = self
            .repository
            .consume_otp(user.id, &payload.purpose, &code_hash)
            .await?;

        if !verified {
            return Err(ApiError::Unauthorized);
        }

        self.repository
            .mark_verified(user.id, &payload.purpose)
            .await?;

        Ok(VerificationResponse { verified })
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

    fn mock_secret(&self, value: String) -> Option<String> {
        (self.state.config.app_env != "production").then_some(value)
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

fn new_otp_code(user_id: Uuid, purpose: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(user_id.as_bytes());
    hasher.update(purpose.as_bytes());
    hasher.update(
        Utc::now()
            .timestamp_nanos_opt()
            .unwrap_or_default()
            .to_be_bytes(),
    );
    let digest = hasher.finalize();
    let value = u32::from_be_bytes([digest[0], digest[1], digest[2], digest[3]]) % 1_000_000;

    format!("{value:06}")
}

fn hash_refresh_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}
