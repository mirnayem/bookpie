CREATE TABLE IF NOT EXISTS search_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    normalized_query TEXT NOT NULL,
    result_count INTEGER NOT NULL CHECK (result_count >= 0),
    source TEXT NOT NULL DEFAULT 'web',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_events_normalized_query ON search_events(normalized_query);
CREATE INDEX IF NOT EXISTS idx_search_events_created_at ON search_events(created_at);
