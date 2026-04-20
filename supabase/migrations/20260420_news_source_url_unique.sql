-- Add unique constraint on news.source_url to support upsert deduplication
ALTER TABLE news
  ADD CONSTRAINT news_source_url_unique UNIQUE (source_url);
