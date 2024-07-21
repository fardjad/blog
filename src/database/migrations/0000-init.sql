-- gist_slugs
CREATE TABLE gist_slugs (
    gist_id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE CHECK (slug <> '')
);
CREATE INDEX gist_slugs_slug ON gist_slugs (slug);

-- gist_sync
CREATE TABLE gist_sync (
    last_sync TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now'))
)