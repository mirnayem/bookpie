use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::modules::books::model::Book;

#[derive(Clone, Debug, Deserialize)]
pub struct SearchQuery {
    pub q: String,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

impl SearchQuery {
    pub fn limit(&self) -> usize {
        self.limit.unwrap_or(20).clamp(1, 100)
    }

    pub fn offset(&self) -> usize {
        self.offset.unwrap_or(0)
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct AutocompleteQuery {
    pub q: String,
    pub limit: Option<usize>,
}

impl AutocompleteQuery {
    pub fn limit(&self) -> usize {
        self.limit.unwrap_or(8).clamp(1, 20)
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookSearchDocument {
    pub id: Uuid,
    pub title: String,
    pub slug: String,
    pub description: Option<String>,
    pub author_name: String,
    pub publisher_name: String,
    pub category_names: Vec<String>,
    pub price: i32,
    pub sale_price: i32,
    pub stock: i32,
    pub cover_image_url: Option<String>,
}

impl From<Book> for BookSearchDocument {
    fn from(book: Book) -> Self {
        Self {
            id: book.id,
            title: book.title,
            slug: book.slug,
            description: book.description,
            author_name: book.author.name,
            publisher_name: book.publisher.name,
            category_names: book
                .categories
                .into_iter()
                .map(|category| category.name)
                .collect(),
            price: book.price,
            sale_price: book.sale_price,
            stock: book.stock,
            cover_image_url: book.cover_image_url,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResult {
    pub hits: Vec<BookSearchDocument>,
    pub query: String,
    pub limit: usize,
    pub offset: usize,
    pub estimated_total_hits: usize,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AutocompleteSuggestion {
    pub title: String,
    pub slug: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReindexResult {
    pub indexed: usize,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MeiliSearchResponse {
    pub hits: Vec<BookSearchDocument>,
    pub estimated_total_hits: Option<usize>,
}
