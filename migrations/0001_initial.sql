-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  csrf_token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Users (public submitters)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  salary TEXT,
  experience TEXT,
  job_type TEXT,
  category TEXT,
  work_from_home INTEGER DEFAULT 0,
  thumbnail TEXT,
  thumbnail_alt TEXT,
  content TEXT,
  responsibilities TEXT,
  requirements TEXT,
  qualifications TEXT,
  benefits TEXT,
  apply_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT,
  status TEXT DEFAULT 'draft',
  featured INTEGER DEFAULT 0,
  trending INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(featured);

-- News
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  featured_image TEXT,
  featured_image_alt TEXT,
  author TEXT,
  tags TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  status TEXT DEFAULT 'draft',
  featured INTEGER DEFAULT 0,
  trending INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS job_tags (
  job_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (job_id, tag_id)
);
CREATE TABLE IF NOT EXISTS news_tags (
  news_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (news_id, tag_id)
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  description TEXT,
  content TEXT,
  apply_url TEXT,
  source_url TEXT,
  category TEXT,
  location TEXT,
  contact_email TEXT,
  thumbnail TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Seed categories
INSERT OR IGNORE INTO categories (name, slug, type) VALUES
  ('Work From Home', 'work-from-home', 'job'),
  ('Remote Jobs', 'remote-jobs', 'job'),
  ('Freshers', 'freshers', 'job'),
  ('Private Jobs', 'private-jobs', 'job'),
  ('Part Time', 'part-time', 'job'),
  ('Full Time', 'full-time', 'job'),
  ('Customer Support', 'customer-support', 'job'),
  ('BPO', 'bpo', 'job'),
  ('IT & Software', 'it-software', 'job'),
  ('Internship', 'internship', 'job'),
  ('Sales', 'sales', 'job'),
  ('Marketing', 'marketing', 'job'),
  ('Other', 'other-jobs', 'job'),
  ('Technology', 'technology', 'news'),
  ('Career', 'career', 'news'),
  ('Jobs News', 'jobs-news', 'news'),
  ('WFH News', 'wfh-news', 'news'),
  ('Education', 'education', 'news'),
  ('Trending', 'trending', 'news'),
  ('Other News', 'other-news', 'news');

-- Default settings
INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('site_name', 'Jobs & News India'),
  ('site_description', 'Find the latest work from home jobs, remote jobs, freshers jobs and career news in India.'),
  ('logo_url', ''),
  ('favicon_url', ''),
  ('contact_email', 'contact@example.com'),
  ('social_twitter', ''),
  ('social_facebook', ''),
  ('social_linkedin', ''),
  ('default_seo_title', 'Jobs & News India - Latest Jobs and Career News'),
  ('default_seo_description', 'Find the latest work from home jobs, remote jobs, freshers jobs and career news in India.'),
  ('google_analytics_id', ''),
  ('adsense_publisher_id', ''),
  ('adsense_enabled', 'false'),
  ('footer_text', '© 2025 Jobs & News India. All rights reserved.');
