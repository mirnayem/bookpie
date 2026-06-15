use reqwest::{Method, StatusCode};
use serde::Serialize;
use uuid::Uuid;

use crate::{config::Config, error::ApiError};

use super::model::{
    AutocompleteSuggestion, BookSearchDocument, MeiliSearchResponse, ReindexResult, SearchResult,
};

#[derive(Clone)]
pub struct SearchService {
    client: reqwest::Client,
    config: Config,
}

impl SearchService {
    pub fn new(client: reqwest::Client, config: Config) -> Self {
        Self { client, config }
    }

    pub async fn search_books(
        &self,
        query: &str,
        limit: usize,
        offset: usize,
    ) -> Result<SearchResult, ApiError> {
        validate_query(query)?;

        let response: MeiliSearchResponse = self
            .meili_request(
                Method::POST,
                &format!("indexes/{}/search", self.config.meili_books_index),
                Some(SearchPayload {
                    q: query,
                    limit,
                    offset,
                    attributes_to_retrieve: &[
                        "id",
                        "title",
                        "slug",
                        "description",
                        "authorName",
                        "publisherName",
                        "categoryNames",
                        "price",
                        "salePrice",
                        "stock",
                        "coverImageUrl",
                    ],
                }),
            )
            .await?;

        Ok(SearchResult {
            estimated_total_hits: response.estimated_total_hits.unwrap_or(response.hits.len()),
            hits: response.hits,
            query: query.to_owned(),
            limit,
            offset,
        })
    }

    pub async fn autocomplete(
        &self,
        query: &str,
        limit: usize,
    ) -> Result<Vec<AutocompleteSuggestion>, ApiError> {
        let result = self.search_books(query, limit, 0).await?;

        Ok(result
            .hits
            .into_iter()
            .map(|hit| AutocompleteSuggestion {
                title: hit.title,
                slug: hit.slug,
            })
            .collect())
    }

    pub async fn index_book(&self, book: BookSearchDocument) -> Result<(), ApiError> {
        self.ensure_books_index().await?;
        self.meili_request::<_, serde_json::Value>(
            Method::POST,
            &format!("indexes/{}/documents", self.config.meili_books_index),
            Some(vec![book]),
        )
        .await?;
        Ok(())
    }

    pub async fn delete_book(&self, id: Uuid) -> Result<(), ApiError> {
        self.meili_request::<(), serde_json::Value>(
            Method::DELETE,
            &format!("indexes/{}/documents/{id}", self.config.meili_books_index),
            None,
        )
        .await?;
        Ok(())
    }

    pub async fn reindex_books(
        &self,
        books: Vec<BookSearchDocument>,
    ) -> Result<ReindexResult, ApiError> {
        self.ensure_books_index().await?;
        let indexed = books.len();
        self.meili_request::<_, serde_json::Value>(
            Method::POST,
            &format!("indexes/{}/documents", self.config.meili_books_index),
            Some(books),
        )
        .await?;
        Ok(ReindexResult { indexed })
    }

    async fn ensure_books_index(&self) -> Result<(), ApiError> {
        let response = self
            .request_builder(
                Method::PUT,
                &format!("indexes/{}", self.config.meili_books_index),
            )
            .json(&serde_json::json!({ "primaryKey": "id" }))
            .send()
            .await?;

        if response.status().is_success() || response.status() == StatusCode::CONFLICT {
            return Ok(());
        }

        Err(ApiError::Search(format!(
            "Meilisearch index setup failed with status {}",
            response.status()
        )))
    }

    async fn meili_request<TPayload, TResponse>(
        &self,
        method: Method,
        path: &str,
        payload: Option<TPayload>,
    ) -> Result<TResponse, ApiError>
    where
        TPayload: Serialize,
        TResponse: serde::de::DeserializeOwned,
    {
        let mut request = self.request_builder(method, path);

        if let Some(payload) = payload {
            request = request.json(&payload);
        }

        let response = request.send().await?;
        let status = response.status();

        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(ApiError::Search(format!(
                "Meilisearch request failed with status {status}: {body}"
            )));
        }

        Ok(response.json::<TResponse>().await?)
    }

    fn request_builder(&self, method: Method, path: &str) -> reqwest::RequestBuilder {
        let url = format!(
            "{}/{}",
            self.config.meili_url.trim_end_matches('/'),
            path.trim_start_matches('/')
        );
        let request = self.client.request(method, url);

        if let Some(api_key) = &self.config.meili_api_key {
            request.bearer_auth(api_key)
        } else {
            request
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SearchPayload<'a> {
    q: &'a str,
    limit: usize,
    offset: usize,
    attributes_to_retrieve: &'a [&'a str],
}

fn validate_query(query: &str) -> Result<(), ApiError> {
    if query.trim().is_empty() {
        return Err(ApiError::Validation("search query is required".to_string()));
    }

    Ok(())
}
