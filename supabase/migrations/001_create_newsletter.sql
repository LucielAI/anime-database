-- Migration: Create archive_newsletter table for newsletter signup storage
-- Run this against your Supabase instance

CREATE TABLE IF NOT EXISTS archive_newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: allow anon inserts, no reads publicly
ALTER TABLE archive_newsletter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert"
  ON archive_newsletter FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "No public read"
  ON archive_newsletter FOR SELECT
  TO anon
  USING (false);
