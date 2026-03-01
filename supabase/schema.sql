-- ═══════════════════════════════════════════════════
--  KAVION — Database Schema
--  Supabase → SQL Editor → Paste → Run
-- ═══════════════════════════════════════════════════

-- ─── PROJECTS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        text        NOT NULL,
  description text,
  status      text        DEFAULT 'active' CHECK (status IN ('active','paused','completed','archived')),
  priority    text        DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  progress    integer     DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  stack       text[]      DEFAULT '{}',
  color       text        DEFAULT '#3B82F6',
  github_repo text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
-- Run this if the table already exists:
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_repo text;

CREATE TABLE IF NOT EXISTS project_todos (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid        REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text        text        NOT NULL,
  done        boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ─── HABITS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        text        NOT NULL,
  color       text        DEFAULT '#EC4899',
  sort_order  integer     DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id    uuid        REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date        date        NOT NULL,
  done        boolean     DEFAULT true,
  UNIQUE (habit_id, date)
);

-- ─── REVENUE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS revenue_sources (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        text        NOT NULL,
  type        text        DEFAULT 'SaaS',
  mrr         numeric     DEFAULT 0,
  growth      numeric     DEFAULT 0,
  status      text        DEFAULT 'active' CHECK (status IN ('active','inactive','churned')),
  stripe_id   text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revenue_entries (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month       date        NOT NULL,
  total_mrr   numeric     DEFAULT 0,
  expenses    numeric     DEFAULT 0,
  notes       text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, month)
);

-- ─── IDEAS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS ideas (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       text        NOT NULL,
  description text,
  score       integer     DEFAULT 5 CHECK (score >= 1 AND score <= 10),
  status      text        DEFAULT 'new' CHECK (status IN ('new','validating','building','shelved','launched')),
  tags        text[]      DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ─── SNIPPETS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS snippets (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       text        NOT NULL,
  description text,
  code        text        DEFAULT '',
  language    text        DEFAULT 'typescript',
  tags        text[]      DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ─── ACQUISITIONS ────────────────────────────────
CREATE TABLE IF NOT EXISTS acquisitions (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            text    NOT NULL,
  url             text,
  asking_price    numeric,
  monthly_revenue numeric,
  monthly_profit  numeric,
  multiple        numeric,
  status          text    DEFAULT 'watching'
                  CHECK (status IN ('watching','due-diligence','offer-made','acquired','passed')),
  notes           text,
  source          text    DEFAULT 'manual',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ─── SERVERS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS servers (
  id            uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          text    NOT NULL,
  host          text    NOT NULL,
  status        text    DEFAULT 'online' CHECK (status IN ('online','degraded','offline')),
  cpu_pct       numeric DEFAULT 0,
  memory_pct    numeric DEFAULT 0,
  uptime_pct    numeric DEFAULT 100,
  response_ms   integer DEFAULT 0,
  provider      text,
  region        text,
  ping_url      text,
  last_checked  timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now()
);

-- ─── YOUTUBE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS youtube_videos (
  id            uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         text    NOT NULL,
  stage         text    DEFAULT 'idea'
                CHECK (stage IN ('idea','scripting','recording','editing','scheduled','published')),
  youtube_id    text,
  views         integer DEFAULT 0,
  likes         integer DEFAULT 0,
  comments      integer DEFAULT 0,
  thumbnail_url text,
  description   text,
  tags          text[]  DEFAULT '{}',
  published_at  timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════
ALTER TABLE projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_todos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits          ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisitions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own projects"        ON projects        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own project_todos"   ON project_todos   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own habits"          ON habits          FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own habit_logs"      ON habit_logs      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own revenue_sources" ON revenue_sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own revenue_entries" ON revenue_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own ideas"           ON ideas           FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own snippets"        ON snippets        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own acquisitions"    ON acquisitions    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own servers"         ON servers         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own youtube_videos"  ON youtube_videos  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════
--  INDEXES
-- ═══════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_projects_user        ON projects        (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date      ON habit_logs      (habit_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_month ON revenue_entries (user_id, month DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_stage        ON youtube_videos  (user_id, stage);

-- ═══════════════════════════════════════════════════
--  UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_ua        BEFORE UPDATE ON projects        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_revenue_sources_ua BEFORE UPDATE ON revenue_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_ideas_ua           BEFORE UPDATE ON ideas           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_snippets_ua        BEFORE UPDATE ON snippets        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_acquisitions_ua    BEFORE UPDATE ON acquisitions    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_youtube_ua         BEFORE UPDATE ON youtube_videos  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── User Settings (API keys stored per-user) ────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  key        text NOT NULL,
  value      text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, key)
);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_user_settings_user ON user_settings(user_id);
CREATE TRIGGER trg_user_settings_ua BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
