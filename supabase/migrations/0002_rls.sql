-- Row-level security
-- Each user sees their own data + approved peers, can write only their own rows.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

-- profiles: read own + approved peers (excluding mutually blocked); write own only
CREATE POLICY profiles_read ON profiles FOR SELECT USING (
  id = auth.uid()
  OR (
    verification_status = 'approved'
    AND deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM blocks
      WHERE (blocker_id = auth.uid() AND blocked_id = profiles.id)
         OR (blocker_id = profiles.id AND blocked_id = auth.uid())
    )
  )
);

CREATE POLICY profiles_insert_self ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_self ON profiles FOR UPDATE
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- dogs: read where the owner row is visible; write own only
CREATE POLICY dogs_read ON dogs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = dogs.owner_id)
);
CREATE POLICY dogs_write_own ON dogs FOR ALL
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- photos: same pattern as dogs
CREATE POLICY photos_read ON photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = photos.profile_id)
);
CREATE POLICY photos_write_own ON photos FOR ALL
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- swipes: read own, insert as self
CREATE POLICY swipes_read_own ON swipes FOR SELECT USING (swiper_id = auth.uid());
CREATE POLICY swipes_insert_self ON swipes FOR INSERT WITH CHECK (swiper_id = auth.uid());

-- matches: read those you're in, soft-update (unmatch) those you're in
CREATE POLICY matches_read_own ON matches FOR SELECT
  USING (profile_a_id = auth.uid() OR profile_b_id = auth.uid());
CREATE POLICY matches_update_own ON matches FOR UPDATE
  USING (profile_a_id = auth.uid() OR profile_b_id = auth.uid());

-- messages: read messages in your matches; insert as self in your matches
CREATE POLICY messages_read ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = messages.match_id
      AND (m.profile_a_id = auth.uid() OR m.profile_b_id = auth.uid())
      AND m.unmatched_at IS NULL
  )
);
CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = messages.match_id
      AND (m.profile_a_id = auth.uid() OR m.profile_b_id = auth.uid())
      AND m.unmatched_at IS NULL
  )
);
CREATE POLICY messages_update_read ON messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = messages.match_id
      AND (m.profile_a_id = auth.uid() OR m.profile_b_id = auth.uid())
  )
);

-- reports: insert as self, read own only
CREATE POLICY reports_read_own ON reports FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY reports_insert_self ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- blocks: read and insert as self
CREATE POLICY blocks_read_own ON blocks FOR SELECT USING (blocker_id = auth.uid());
CREATE POLICY blocks_write_own ON blocks FOR ALL
  USING (blocker_id = auth.uid()) WITH CHECK (blocker_id = auth.uid());

-- moderators: read own row only (used by admin web to verify moderator status)
CREATE POLICY moderators_read_self ON moderators FOR SELECT USING (user_id = auth.uid());
