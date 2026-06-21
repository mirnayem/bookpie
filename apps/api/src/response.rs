use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginationMeta {
    pub page: i64,
    pub limit: i64,
    pub offset: i64,
    pub total: i64,
    pub total_pages: i64,
    pub has_next_page: bool,
    pub has_previous_page: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedResponse<T>
where
    T: Serialize,
{
    pub items: Vec<T>,
    pub pagination: PaginationMeta,
}

impl<T> PaginatedResponse<T>
where
    T: Serialize,
{
    pub fn new(items: Vec<T>, total: i64, limit: i64, offset: i64) -> Self {
        let limit = limit.max(1);
        let offset = offset.max(0);
        let page = (offset / limit) + 1;
        let total_pages = if total == 0 {
            0
        } else {
            (total + limit - 1) / limit
        };

        Self {
            items,
            pagination: PaginationMeta {
                page,
                limit,
                offset,
                total,
                total_pages,
                has_next_page: offset + limit < total,
                has_previous_page: offset > 0,
            },
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ApiResponse<T>
where
    T: Serialize,
{
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<ApiErrorBody>,
}

#[derive(Debug, Serialize)]
pub struct ApiErrorBody {
    pub code: String,
    pub message: String,
}

impl<T> ApiResponse<T>
where
    T: Serialize,
{
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }
}

impl ApiResponse<()> {
    pub fn fail(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(ApiErrorBody {
                code: code.into(),
                message: message.into(),
            }),
        }
    }
}
