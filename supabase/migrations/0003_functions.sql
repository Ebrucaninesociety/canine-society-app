-- next_deck: returns candidate profiles for the calling user.
-- Filters: approved + not soft-deleted + same country + gender match + not already swiped + not mutually blocked.
CREATE OR REPLACE FUNCTION next_deck(limit_count int DEFAULT 20)
RETURNS SETOF profiles
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  WITH me AS (
    SELECT id, country, gender, looking_for
    FROM profiles
    WHERE id = auth.uid()
  )
  SELECT p.*
  FROM profiles p, me
  WHERE p.id <> me.id
    AND p.verification_status = 'approved'
    AND p.deleted_at IS NULL
    AND p.country = me.country
    -- The candidate's gender must be in my looking_for
    AND (
      'everyone' = ANY (SELECT unnest(me.looking_for)::text)
      OR p.gender::text = ANY (
        SELECT CASE
          WHEN lf = 'women' THEN 'woman'
          WHEN lf = 'men' THEN 'man'
          ELSE NULL
        END
        FROM unnest(me.looking_for) lf
      )
    )
    -- And my gender must be in the candidate's looking_for
    AND (
      'everyone' = ANY (SELECT unnest(p.looking_for)::text)
      OR me.gender::text = ANY (
        SELECT CASE
          WHEN lf = 'women' THEN 'woman'
          WHEN lf = 'men' THEN 'man'
          ELSE NULL
        END
        FROM unnest(p.looking_for) lf
      )
    )
    AND NOT EXISTS (
      SELECT 1 FROM swipes s
      WHERE s.swiper_id = me.id AND s.swipee_id = p.id AND s.intent = 'date'
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocks b
      WHERE (b.blocker_id = me.id AND b.blocked_id = p.id)
         OR (b.blocker_id = p.id AND b.blocked_id = me.id)
    )
  ORDER BY p.last_active_at DESC NULLS LAST, p.created_at DESC
  LIMIT limit_count;
$$;

-- Match trigger: on insert of a like/superlike, if the counterpart exists with same intent,
-- create a row in matches (ordered so profile_a_id < profile_b_id, dedup via UNIQUE).
CREATE OR REPLACE FUNCTION on_swipe_create_match() RETURNS trigger AS $$
DECLARE
  a uuid;
  b uuid;
BEGIN
  IF NEW.direction NOT IN ('like','superlike') THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM swipes
    WHERE swiper_id = NEW.swipee_id
      AND swipee_id = NEW.swiper_id
      AND direction IN ('like','superlike')
      AND intent = NEW.intent
  ) THEN
    RETURN NEW;
  END IF;
  a := LEAST(NEW.swiper_id, NEW.swipee_id);
  b := GREATEST(NEW.swiper_id, NEW.swipee_id);
  INSERT INTO matches (profile_a_id, profile_b_id, intent)
  VALUES (a, b, NEW.intent)
  ON CONFLICT (profile_a_id, profile_b_id, intent) DO NOTHING;
  RETURN NEW;
END $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_swipe_match
  AFTER INSERT ON swipes
  FOR EACH ROW EXECUTE FUNCTION on_swipe_create_match();
