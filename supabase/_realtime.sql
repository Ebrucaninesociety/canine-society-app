-- Enable Supabase Realtime on the tables that the mobile app subscribes to.
-- Without this, postgres_changes events for INSERT/UPDATE on these tables
-- never fire and incoming messages / new matches do not appear live.
--
-- Safe to re-run: ALTER PUBLICATION ... ADD TABLE is idempotent per session
-- and Supabase tracks already-added tables.

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
