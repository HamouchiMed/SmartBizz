const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

dotenv.config();

// automatically apply schema on startup - safe because file uses IF NOT EXISTS
(async () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    // split statements on semicolon+newline like seed.js does
    const statements = sql
      .replace(/\uFEFF/, '')           // strip BOM if present
      .split(/;\s*\n/)               // split on semicolon+newline
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    console.log(`applying ${statements.length} schema statements`);
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    console.log('schema applied');
  } catch (err) {
    console.error('failed to apply schema', err.message || err);
  }
})();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name, email',
      [name, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user, token });
  } catch (err) {
    return res.status(500).json({ error: 'Register failed', details: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const result = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

app.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
    return res.json(result.rows[0] || null);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

function listCreateRoutes(table, fields) {
  app.get(`/${table}`, auth, async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${table} WHERE user_id = $1 ORDER BY id DESC`, [req.user.id]);
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: `Failed to load ${table}` });
    }
  });

  app.get(`/${table}/:id`, auth, async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
      return res.json(result.rows[0] || null);
    } catch (err) {
      return res.status(500).json({ error: `Failed to load ${table}` });
    }
  });

  app.post(`/${table}`, auth, async (req, res) => {
    try {
      // quote each field name in case it's a reserved keyword (e.g. "from")
      const columns = fields.map((f) => `"${f}"`).join(',');
      const values = fields.map((f) => req.body?.[f] ?? null);
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(',');
      const query = `INSERT INTO ${table} (${columns}, user_id) VALUES (${placeholders}, $${fields.length + 1}) RETURNING *`;
      const result = await pool.query(query, [...values, req.user.id]);
      return res.json(result.rows[0]);
    } catch (err) {
      console.error(`error creating ${table}:`, err.message || err);
      return res.status(500).json({ error: `Failed to create ${table}`, details: err.message });
    }
  });

  app.put(`/${table}/:id`, auth, async (req, res) => {
    try {
      // quote field names when constructing SET clause
      const sets = fields.map((f, i) => `"${f}"=$${i + 1}`).join(',');
      const values = fields.map((f) => req.body?.[f] ?? null);
      const query = `UPDATE ${table} SET ${sets} WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} RETURNING *`;
      const result = await pool.query(query, [...values, req.params.id, req.user.id]);
      return res.json(result.rows[0] || null);
    } catch (err) {
      return res.status(500).json({ error: `Failed to update ${table}`, details: err.message });
    }
  });

  app.delete(`/${table}/:id`, auth, async (req, res) => {
    try {
      await pool.query(`DELETE FROM ${table} WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
      return res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: `Failed to delete ${table}`, details: err.message });
    }
  });
}

listCreateRoutes('profiles', ['name', 'photo_url', 'phone', 'company', 'role', 'address', 'city', 'country']);
listCreateRoutes('events', ['title', 'datetime', 'location', 'type', 'owner', 'status', 'category', 'reminder']);
listCreateRoutes('contacts', ['name', 'email', 'phone', 'company', 'role', 'city', 'address', 'hours', 'website', 'notes']);
listCreateRoutes('deals', ['name', 'client', 'email', 'amount', 'stage', 'status', 'close_date', 'dueDate', 'category', 'progress', 'details']);
listCreateRoutes('messages', ['conversation_id', 'sender_name', 'recipient_name', 'body', 'type', 'dealId', 'from', 'text', 'time', 'image', 'documentName']);
// simple helper for wallet transaction storage
listCreateRoutes('transactions', ['title', 'amount', 'type', 'date']);
// leads for CRM
listCreateRoutes('leads', ['name','email','phone','company','status']);
// analytics metrics snapshots
listCreateRoutes('analytics_metrics', ['period_label', 'revenue', 'new_leads', 'churn', 'avg_deal']);

// balance endpoints: get or upsert a single per-user balance
app.get('/balance', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT amount FROM balances WHERE user_id = $1', [req.user.id]);
    const row = result.rows[0];
    return res.json({ amount: row ? parseFloat(row.amount) : null });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load balance' });
  }
});

app.put('/balance', auth, async (req, res) => {
  try {
    const { amount } = req.body || {};
    const result = await pool.query(
      'INSERT INTO balances (user_id, amount) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET amount = EXCLUDED.amount, updated_at = NOW() RETURNING *',
      [req.user.id, amount]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('balance upsert error', err.message || err);
    return res.status(500).json({ error: 'Failed to update balance' });
  }
});

// automatically ensure the messages table has all expected columns (useful when schema evolves)
async function ensureMessageColumns() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='messages'");
    const cols = res.rows.map((r) => r.column_name);
    const needed = [
      {name:'type', sql:"ALTER TABLE messages ADD COLUMN \"type\" TEXT DEFAULT 'text'"},
      {name:'dealId', sql:"ALTER TABLE messages ADD COLUMN \"dealId\" INTEGER REFERENCES deals(id) ON DELETE CASCADE"},
      {name:'from', sql:"ALTER TABLE messages ADD COLUMN \"from\" TEXT DEFAULT 'client'"},
      {name:'text', sql:"ALTER TABLE messages ADD COLUMN \"text\" TEXT"},
      {name:'time', sql:"ALTER TABLE messages ADD COLUMN \"time\" TEXT"},
      {name:'image', sql:"ALTER TABLE messages ADD COLUMN \"image\" TEXT"},
      {name:'documentName', sql:"ALTER TABLE messages ADD COLUMN \"documentName\" TEXT"},
    ];
    let addedFrom = false;
    for (const col of needed) {
      if (!cols.includes(col.name)) {
        console.log('adding missing column to messages table:', col.name);
        await pool.query(col.sql);
        if (col.name === 'from') addedFrom = true;
      }
    }
    // if a from column existed but rows may have null, or it was just added, default them to client
    if (cols.includes('from') || addedFrom) {
      await pool.query("UPDATE messages SET \"from\"='client' WHERE \"from\" IS NULL");
    }
  } catch (err) {
    console.error('error ensuring message columns', err.message || err);
  }
}

// ensure contacts table has expected columns (in case schema evolved)
async function ensureContactsColumns() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='contacts'");
    const cols = res.rows.map((r) => r.column_name);
    const needed = [
      { name: 'name', sql: "ALTER TABLE contacts ADD COLUMN \"name\" TEXT" },
      { name: 'email', sql: "ALTER TABLE contacts ADD COLUMN \"email\" TEXT" },
      { name: 'phone', sql: "ALTER TABLE contacts ADD COLUMN \"phone\" TEXT" },
      { name: 'company', sql: "ALTER TABLE contacts ADD COLUMN \"company\" TEXT" },
      { name: 'role', sql: "ALTER TABLE contacts ADD COLUMN \"role\" TEXT" },
      { name: 'city', sql: "ALTER TABLE contacts ADD COLUMN \"city\" TEXT" },
      { name: 'address', sql: "ALTER TABLE contacts ADD COLUMN \"address\" TEXT" },
      { name: 'hours', sql: "ALTER TABLE contacts ADD COLUMN \"hours\" TEXT" },
      { name: 'website', sql: "ALTER TABLE contacts ADD COLUMN \"website\" TEXT" },
      { name: 'notes', sql: "ALTER TABLE contacts ADD COLUMN \"notes\" TEXT" },
    ];
    for (const col of needed) {
      if (!cols.includes(col.name)) {
        console.log('adding missing column to contacts table:', col.name);
        await pool.query(col.sql);
      }
    }
  } catch (err) {
    console.error('error ensuring contacts columns', err.message || err);
  }
}

// ensure deals table includes any required columns
async function ensureDealsColumns() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='deals'");
    const cols = res.rows.map((r) => r.column_name);
    const needed = [
      { name: 'name', sql: "ALTER TABLE deals ADD COLUMN \"name\" TEXT" },
      { name: 'client', sql: "ALTER TABLE deals ADD COLUMN \"client\" TEXT" },
      { name: 'email', sql: "ALTER TABLE deals ADD COLUMN \"email\" TEXT" },
      { name: 'amount', sql: "ALTER TABLE deals ADD COLUMN \"amount\" TEXT" },
      { name: 'stage', sql: "ALTER TABLE deals ADD COLUMN \"stage\" TEXT" },
      { name: 'status', sql: "ALTER TABLE deals ADD COLUMN \"status\" TEXT" },
      { name: 'close_date', sql: "ALTER TABLE deals ADD COLUMN \"close_date\" TEXT" },
      { name: 'dueDate', sql: "ALTER TABLE deals ADD COLUMN \"dueDate\" TEXT" },
      { name: 'category', sql: "ALTER TABLE deals ADD COLUMN \"category\" TEXT" },
      { name: 'progress', sql: "ALTER TABLE deals ADD COLUMN \"progress\" INTEGER DEFAULT 0" },
      { name: 'details', sql: "ALTER TABLE deals ADD COLUMN \"details\" TEXT" },
    ];
    for (const col of needed) {
      if (!cols.includes(col.name)) {
        console.log('adding missing column to deals table:', col.name);
        await pool.query(col.sql);
      }
    }
  } catch (err) {
    console.error('error ensuring deals columns', err.message || err);
  }
}

// ensure analytics_metrics table has expected columns (in case schema evolved)
async function ensureAnalyticsMetricsColumns() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='analytics_metrics'");
    const cols = res.rows.map((r) => r.column_name);
    const needed = [
      { name: 'period_label', sql: "ALTER TABLE analytics_metrics ADD COLUMN \"period_label\" TEXT DEFAULT 'weekly'" },
      { name: 'revenue', sql: "ALTER TABLE analytics_metrics ADD COLUMN \"revenue\" NUMERIC DEFAULT 0" },
      { name: 'new_leads', sql: "ALTER TABLE analytics_metrics ADD COLUMN \"new_leads\" INTEGER DEFAULT 0" },
      { name: 'churn', sql: "ALTER TABLE analytics_metrics ADD COLUMN \"churn\" NUMERIC DEFAULT 0" },
      { name: 'avg_deal', sql: "ALTER TABLE analytics_metrics ADD COLUMN \"avg_deal\" NUMERIC DEFAULT 0" },
    ];
    for (const col of needed) {
      if (!cols.includes(col.name)) {
        console.log('adding missing column to analytics_metrics table:', col.name);
        await pool.query(col.sql);
      }
    }
  } catch (err) {
    console.error('error ensuring analytics_metrics columns', err.message || err);
  }
}

ensureMessageColumns()
  .then(() => ensureContactsColumns())
  .then(() => ensureDealsColumns())
  .then(() => ensureAnalyticsMetricsColumns())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error('failed to ensure columns', e);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
