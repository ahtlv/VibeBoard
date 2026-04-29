-- Schema snapshot BEFORE migration: add_color_to_columns
-- Date: 2026-04-29
-- Migration applied: ALTER TABLE columns ADD COLUMN color varchar(7) NULL;

CREATE TABLE board_members (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  board_id uuid NOT NULL,
  user_id uuid,
  email varchar NOT NULL,
  role varchar DEFAULT 'member'::character varying NOT NULL,
  status varchar DEFAULT 'active'::character varying NOT NULL,
  invited_by uuid,
  joined_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE boards (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  workspace_id uuid NOT NULL,
  created_by uuid,
  title varchar(255) NOT NULL,
  description text,
  is_archived bool DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE checklist_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  task_id uuid NOT NULL,
  text varchar(1000) NOT NULL,
  is_completed bool DEFAULT false NOT NULL,
  position int4 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE columns (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  board_id uuid NOT NULL,
  title varchar(255) NOT NULL,
  position int4 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
  -- NOTE: color varchar(7) was added AFTER this snapshot
);

CREATE TABLE invitations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  workspace_id uuid NOT NULL,
  invited_by uuid,
  email varchar(255) NOT NULL,
  role varchar(20) DEFAULT 'member'::character varying NOT NULL,
  token varchar(64) NOT NULL,
  status varchar(20) DEFAULT 'pending'::character varying NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  workspace_id uuid,
  plan varchar(20) DEFAULT 'free'::character varying NOT NULL,
  status varchar(20) DEFAULT 'active'::character varying NOT NULL,
  stripe_customer_id varchar(255),
  stripe_subscription_id varchar(255),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end bool DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE tasks (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  board_id uuid NOT NULL,
  column_id uuid NOT NULL,
  created_by uuid,
  title varchar(500) NOT NULL,
  description text,
  position int4 NOT NULL,
  status varchar(20) DEFAULT 'todo'::character varying NOT NULL,
  priority varchar(20) DEFAULT 'medium'::character varying NOT NULL,
  due_date timestamptz,
  tracked_time_total int4 DEFAULT 0 NOT NULL,
  pomodoro_sessions_count int4 DEFAULT 0 NOT NULL,
  recurring_rule jsonb,
  is_archived bool DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE time_entries (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  duration_seconds int4,
  status varchar(20) DEFAULT 'active'::character varying NOT NULL,
  source varchar(20) DEFAULT 'tracker'::character varying NOT NULL,
  note text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  email varchar(255) NOT NULL,
  name varchar(255) DEFAULT ''::character varying NOT NULL,
  avatar_url text,
  plan varchar(20) DEFAULT 'free'::character varying NOT NULL,
  settings_theme varchar(10) DEFAULT 'system'::character varying NOT NULL,
  settings_language varchar(10) DEFAULT 'en'::character varying NOT NULL,
  settings_email_notifications bool DEFAULT true NOT NULL,
  settings_desktop_notifications bool DEFAULT false NOT NULL,
  is_active bool DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE workspace_members (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  workspace_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role varchar(20) DEFAULT 'member'::character varying NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE workspaces (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  owner_id uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
