-- Schema dump before migration: add bg_color to tasks, create task_assignees
-- Date: 2026-04-30

CREATE TABLE IF NOT EXISTS boards (id uuid NOT NULL DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL, created_by uuid, title character varying(255) NOT NULL, description text, is_archived boolean NOT NULL DEFAULT false, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS columns (id uuid NOT NULL DEFAULT gen_random_uuid(), board_id uuid NOT NULL, title character varying(255) NOT NULL, position integer NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), color character varying(7));

CREATE TABLE IF NOT EXISTS tasks (id uuid NOT NULL DEFAULT gen_random_uuid(), board_id uuid NOT NULL, column_id uuid NOT NULL, created_by uuid, title character varying(500) NOT NULL, description text, position integer NOT NULL, status character varying(20) NOT NULL DEFAULT 'todo'::character varying, priority character varying(20) NOT NULL DEFAULT 'medium'::character varying, due_date timestamp with time zone, tracked_time_total integer NOT NULL DEFAULT 0, pomodoro_sessions_count integer NOT NULL DEFAULT 0, recurring_rule jsonb, is_archived boolean NOT NULL DEFAULT false, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS workspace_members (id uuid NOT NULL DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL, user_id uuid NOT NULL, role character varying(20) NOT NULL DEFAULT 'member'::character varying, joined_at timestamp with time zone NOT NULL DEFAULT now());
