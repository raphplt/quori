-- installations
CREATE TABLE IF NOT EXISTS installations (
  installation_id bigint PRIMARY KEY,
  account_login text,
  account_id bigint,
  repos text[],
  created_at timestamptz DEFAULT now()
);

-- events
CREATE TABLE IF NOT EXISTS events (
  delivery_id text PRIMARY KEY,
  installation_id bigint REFERENCES installations(installation_id),
  event text,
  payload jsonb,
  received_at timestamptz DEFAULT now(),
  processed boolean DEFAULT false
);

-- posts
CREATE TABLE IF NOT EXISTS posts (
  post_id serial PRIMARY KEY,
  installation_id bigint REFERENCES installations(installation_id),
  repo_full_name text,
  event_type text,
  content_draft text,
  created_at timestamptz DEFAULT now()
);
