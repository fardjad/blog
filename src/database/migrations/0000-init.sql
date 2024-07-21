-- gist_posts
CREATE TABLE gist_posts (
    gist_id TEXT PRIMARY KEY,
    gist_info TEXT NOT NULL,
     
    description TEXT GENERATED ALWAYS AS (json_extract(gist_info, '$.description')) STORED,
    files TEXT GENERATED ALWAYS AS (json_extract(gist_info, '$.files')) STORED,
    html_url TEXT GENERATED ALWAYS AS (json_extract(gist_info, '$.html_url')) STORED,
    public BOOLEAN GENERATED ALWAYS AS (json_extract(gist_info, '$.public')) STORED,
    created_at TEXT GENERATED ALWAYS AS (json_extract(gist_info, '$.created_at')) STORED,
    updated_at TEXT GENERATED ALWAYS AS (json_extract(gist_info, '$.updated_at')) STORED,
    owner_html_url TEXT GENERATED ALWAYS AS (json_extract(gist_info, '$.owner.html_url')) STORED,

    -- will be set by the trigger
    filename TEXT,
    file_raw_url TEXT
);

CREATE INDEX gist_posts_description_idx ON gist_posts(description);
CREATE INDEX gist_posts_public_idx ON gist_posts(public);
CREATE INDEX gist_posts_created_at_idx ON gist_posts(created_at);
CREATE INDEX gist_posts_updated_at_idx ON gist_posts(updated_at);
CREATE INDEX gist_posts_filename_idx ON gist_posts(filename);

CREATE TRIGGER set_filename_and_file_raw_url
AFTER INSERT ON gist_posts
FOR EACH ROW
BEGIN	
	UPDATE gist_posts
    SET 
        filename = (
        	SELECT json_extract(value, '$.filename')
            FROM json_each(NEW.gist_info, '$.files') 
            LIMIT 1
        ),
        file_raw_url = (
            SELECT json_extract(value, '$.raw_url') 
            FROM json_each(NEW.gist_info, '$.files') 
            LIMIT 1
        )
    WHERE 
        gist_id = NEW.gist_id;
END;

-- gist_sync
CREATE TABLE gist_sync (
    last_sync TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now'))
)