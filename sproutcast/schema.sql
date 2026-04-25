-- SproutCast database schema
-- Run once: psql "$DATABASE_URL" -f schema.sql

-- ===== users =====
CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  name           VARCHAR(100),
  role           VARCHAR(20)  NOT NULL DEFAULT 'user'
                 CHECK (role IN ('user', 'admin')),
  saved_city     VARCHAR(100),
  saved_lat      NUMERIC(9,6),
  saved_lon      NUMERIC(9,6),
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- ===== plants =====
CREATE TABLE plants (
  id               SERIAL PRIMARY KEY,
  external_id      INTEGER UNIQUE,       -- Perenual ID; NULL if admin-curated
  common_name      VARCHAR(200) NOT NULL,
  scientific_name  VARCHAR(200),
  description      TEXT,
  min_temp_f       INTEGER,
  max_temp_f       INTEGER,
  watering         VARCHAR(50),          -- 'frequent'|'average'|'minimum'|'none'
  sunlight         VARCHAR(100),         -- CSV: 'full_sun,part_shade'
  image_url        TEXT,
  seasons          VARCHAR(100),         -- CSV: 'spring,summer'
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ===== garden_entries =====
CREATE TABLE garden_entries (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  plant_id  INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  notes     TEXT,
  position  INTEGER,
  added_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, plant_id)
);

-- ===== weather_cache (optional) =====
CREATE TABLE weather_cache (
  id            SERIAL PRIMARY KEY,
  location_key  VARCHAR(100) UNIQUE NOT NULL,
  data          JSONB NOT NULL,
  fetched_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ===== indexes =====
CREATE INDEX idx_garden_user       ON garden_entries (user_id);
CREATE INDEX idx_plants_external   ON plants         (external_id);
CREATE INDEX idx_weather_fetched   ON weather_cache  (fetched_at);

-- ===== seed an admin (change the hash before running) =====
-- Generate the hash locally:
--   node -e "require('bcryptjs').hash('YOUR_PASSWORD', 10).then(console.log)"
-- Then uncomment and paste:
-- INSERT INTO users (email, password_hash, name, role)
-- VALUES ('admin@sproutcast.dev', '<paste_hash_here>', 'Admin', 'admin');