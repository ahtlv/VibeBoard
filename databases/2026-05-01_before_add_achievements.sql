-- Schema dump before migration: add achievements + user_achievements tables
-- Date: 2026-05-01
-- State: after add_pause_resume_to_time_entries

-- See 2026-05-01_before_add_pause_resume.sql for full schema.
-- Additional fields now present in time_entries:
--   paused_at timestamptz NULL
--   accumulated_seconds integer NOT NULL DEFAULT 0
--
-- Achievements tables do NOT yet exist at this point.
