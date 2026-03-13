-- Backfill optional metadata columns used by serverless handlers.
-- Safe no-op for existing environments where columns already exist.

ALTER TABLE IF EXISTS archive_feedback
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS context text;

ALTER TABLE IF EXISTS archive_suggestions
  ADD COLUMN IF NOT EXISTS source text;
