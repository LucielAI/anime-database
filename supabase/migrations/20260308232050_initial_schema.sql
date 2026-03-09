-- Initial schema for Anime Architecture Archive feedback and suggestions
-- Tables match the specific requirements of the Vercel-native Supabase integration

CREATE TABLE IF NOT EXISTS archive_feedback (
  id bigint primary key generated always as identity,
  page_slug text not null,
  vote_type text not null CHECK (vote_type IN ('helpful', 'unhelpful', 'needs_data')),
  created_at timestamptz not null default now(),
  CONSTRAINT slug_not_empty CHECK (length(trim(page_slug)) > 0)
);

CREATE TABLE IF NOT EXISTS archive_suggestions (
  id bigint primary key generated always as identity,
  anime_name text not null,
  created_at timestamptz not null default now(),
  CONSTRAINT name_not_empty CHECK (length(trim(anime_name)) > 0)
);

-- RLS (Row Level Security) - Allowing Service Role writes but protecting from public deletes/updates
ALTER TABLE archive_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive_suggestions ENABLE ROW LEVEL SECURITY;

-- Note: Since we use the service role key server-side, it bypasses RLS by default.
-- If public access was needed, we would add specific policices.
