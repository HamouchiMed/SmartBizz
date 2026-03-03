CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  photo_url TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  datetime TIMESTAMPTZ,
  location TEXT,
  type TEXT,
  owner TEXT,
  status TEXT,
  category TEXT,
  reminder TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  city TEXT,
  address TEXT,
  hours TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  client TEXT,
  email TEXT,
  amount TEXT,
  stage TEXT,
  status TEXT,
  close_date TEXT,
  dueDate TEXT,
  category TEXT,
  progress INTEGER DEFAULT 0,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  conversation_id TEXT,
  sender_name TEXT,
  recipient_name TEXT,
  body TEXT,
  type TEXT DEFAULT 'text',
  dealId INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  "from" TEXT DEFAULT 'client',
  text TEXT,
  time TEXT,
  image TEXT,
  documentName TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- wallet transactions for balance tracking
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  amount TEXT,
  type TEXT,
  date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- leads table for potential clients
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- persisted available balance per user (one row per user)
CREATE TABLE IF NOT EXISTS balances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  amount NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- analytics snapshots used by Analytics screen cards
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  period_label TEXT DEFAULT 'weekly',
  revenue NUMERIC DEFAULT 0,
  new_leads INTEGER DEFAULT 0,
  churn NUMERIC DEFAULT 0,
  avg_deal NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
