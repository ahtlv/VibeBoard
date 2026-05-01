-- Schema dump before migration: add paused_at + accumulated_seconds to time_entries
-- Date: 2026-05-01
-- Tables captured via Supabase MCP list_tables

-- public.users
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  name character varying NOT NULL DEFAULT ''::character varying,
  avatar_url text,
  plan character varying NOT NULL DEFAULT 'free'::character varying,
  settings_theme character varying NOT NULL DEFAULT 'system'::character varying,
  settings_language character varying NOT NULL DEFAULT 'en'::character varying,
  settings_email_notifications boolean NOT NULL DEFAULT true,
  settings_desktop_notifications boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- public.workspaces
CREATE TABLE public.workspaces (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  owner_id uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- public.workspace_members
CREATE TABLE public.workspace_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id),
  user_id uuid NOT NULL REFERENCES public.users(id),
  role character varying NOT NULL DEFAULT 'member'::character varying,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- public.boards
CREATE TABLE public.boards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id),
  created_by uuid REFERENCES public.users(id),
  title character varying NOT NULL,
  description text,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- public.columns
CREATE TABLE public.columns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.boards(id),
  title character varying NOT NULL,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  color character varying,
  PRIMARY KEY (id)
);

-- public.tasks
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.boards(id),
  column_id uuid NOT NULL REFERENCES public.columns(id),
  created_by uuid REFERENCES public.users(id),
  title character varying NOT NULL,
  description text,
  position integer NOT NULL,
  status character varying NOT NULL DEFAULT 'todo'::character varying,
  priority character varying NOT NULL DEFAULT 'medium'::character varying,
  due_date timestamptz,
  tracked_time_total integer NOT NULL DEFAULT 0,
  pomodoro_sessions_count integer NOT NULL DEFAULT 0,
  recurring_rule jsonb,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  bg_color character varying,
  PRIMARY KEY (id)
);

-- public.checklist_items
CREATE TABLE public.checklist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id),
  text character varying NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- public.time_entries
CREATE TABLE public.time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id),
  user_id uuid NOT NULL REFERENCES public.users(id),
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  duration_seconds integer,
  status character varying NOT NULL DEFAULT 'active'::character varying,
  source character varying NOT NULL DEFAULT 'tracker'::character varying,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
-- NOTE: paused_at and accumulated_seconds NOT YET added (this is pre-migration state)

-- public.subscriptions
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id),
  workspace_id uuid REFERENCES public.workspaces(id),
  plan character varying NOT NULL DEFAULT 'free'::character varying,
  status character varying NOT NULL DEFAULT 'active'::character varying,
  stripe_customer_id character varying UNIQUE,
  stripe_subscription_id character varying UNIQUE,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- public.invitations
CREATE TABLE public.invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id),
  invited_by uuid REFERENCES public.users(id),
  email character varying NOT NULL,
  role character varying NOT NULL DEFAULT 'member'::character varying,
  token character varying NOT NULL UNIQUE,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- public.board_members
CREATE TABLE public.board_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.boards(id),
  user_id uuid REFERENCES public.users(id),
  email character varying NOT NULL,
  role character varying NOT NULL DEFAULT 'member'::character varying CHECK (role::text = ANY (ARRAY['owner', 'admin', 'member'])),
  status character varying NOT NULL DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active', 'pending'])),
  invited_by uuid REFERENCES public.users(id),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- public.task_assignees
CREATE TABLE public.task_assignees (
  task_id uuid NOT NULL REFERENCES public.tasks(id),
  user_id uuid NOT NULL,
  board_id uuid NOT NULL REFERENCES public.boards(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, user_id)
);
