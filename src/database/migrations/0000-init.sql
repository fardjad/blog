-- posts
CREATE TABLE posts (
    gist_id TEXT PRIMARY KEY,
    html_url TEXT NOT NULL,
    content_url TEXT,

    title TEXT NOT NULL,
    tags TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    owner_id INTEGER NOT NULL, 
    public BOOLEAN NOT NULL,
    
    slug TEXT NOT NULL,
    slug_counter INTEGER NOT NULL DEFAULT 0,

    slug_with_counter TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN slug_counter = 0 THEN slug
            ELSE slug || '-' || slug_counter
        END
    ) STORED
);

CREATE INDEX slug ON posts(slug);
CREATE UNIQUE INDEX unique_slug ON posts(slug, slug_counter);
CREATE INDEX slug_with_counter ON posts(slug_with_counter);
CREATE INDEX created_at ON posts(created_at);

-- gist_sync
CREATE TABLE gist_sync (
    row_id INTEGER PRIMARY KEY CHECK (row_id = 1), -- only one row
    last_sync TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now'))
)