const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const pool = require('./db');

// apply schema before seeding so the command can be run without manual SQL
async function applySchema() {
  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  // split into individual statements to avoid multi-statement parsing issues
  const statements = sql
    .replace(/\uFEFF/, '')           // strip BOM if present
    .split(/;\s*\n/)               // simple delimiter on semicolon+newline
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  console.log(`applying ${statements.length} schema statements`);
  for (const stmt of statements) {
    await pool.query(stmt);
  }
  console.log('schema applied in seed script');
}

async function seed() {
  await applySchema();
  const email = 'demo@smartbizz.ma';
  const password = 'password123';
  const name = 'Mohamed Hamouchi';
  const hash = await bcrypt.hash(password, 10);

  const userRes = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, password_hash=EXCLUDED.password_hash RETURNING id',
    [name, email, hash]
  );
  const userId = userRes.rows[0].id;

  await pool.query(
    'INSERT INTO profiles (user_id, name, photo_url, phone, company, role, address, city, country) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [userId, name, '', '+212 6 12 34 56 78', 'SmartBizz LLC', 'Business Owner', '20 Avenue Mohammed V', 'Rabat', 'Morocco']
  );

  await pool.query(
    'INSERT INTO contacts (user_id, name, email, phone, company, role, city) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [userId, 'Sara Bennis', 'sara@atlastech.ma', '+212 6 90 12 33 44', 'Atlas Tech', 'CTO', 'Casablanca']
  );

  await pool.query(
    'INSERT INTO deals (user_id, name, client, amount, stage, status, close_date) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [userId, 'Atlas Tech Expansion', 'Atlas Tech', '$120k', 'Negotiation', 'Open', '2026-03-15']
  );

  await pool.query(
    'INSERT INTO events (user_id, title, datetime, location, type, owner, status, category, reminder) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [userId, 'Client Meeting - Tech Corp', '2026-02-20T10:00:00Z', 'Conference Room A', 'Meeting', 'You', 'Scheduled', 'Sales', '1h']
  );

  await pool.query(
    'INSERT INTO messages (user_id, conversation_id, sender_name, recipient_name, body) VALUES ($1,$2,$3,$4,$5)',
    [userId, 'conv-1', 'Mohamed Hamouchi', 'Sara Bennis', 'Hello! Let\'s sync tomorrow.']
  );

  // a couple of messages associated with the seeded deal so the chat screen has something to show
  await pool.query(
    'INSERT INTO messages (user_id, conversation_id, sender_name, recipient_name, body, dealId, "from") VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [userId, 'conv-deal', 'Mohamed Hamouchi', 'Atlas Tech', 'Looking forward to closing this deal.', 1, 'me']
  );
  await pool.query(
    'INSERT INTO messages (user_id, conversation_id, sender_name, recipient_name, body, dealId, "from") VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [userId, 'conv-deal', 'Atlas Tech', 'Mohamed Hamouchi', 'Absolutely, we can finalize next week.', 1, 'client']
  );

  // seed some wallet transactions
  await pool.query(
    'INSERT INTO transactions (user_id, title, amount, type, date) VALUES ($1,$2,$3,$4,$5)',
    [userId, 'Initial deposit', '$500', 'income', new Date().toISOString()]
  );
  await pool.query(
    'INSERT INTO transactions (user_id, title, amount, type, date) VALUES ($1,$2,$3,$4,$5)',
    [userId, 'Grocery shopping', '-$45', 'expense', new Date().toISOString()]
  );
  // seed a couple of leads
  await pool.query(
    'INSERT INTO leads (user_id, name, email, phone, company, status) VALUES ($1,$2,$3,$4,$5,$6)',
    [userId, 'Jane Doe', 'jane@example.com', '+1234567890', 'Acme Corp', 'New']
  );
  await pool.query(
    'INSERT INTO leads (user_id, name, email, phone, company, status) VALUES ($1,$2,$3,$4,$5,$6)',
    [userId, 'John Smith', 'john@example.com', '+0987654321', 'Beta LLC', 'Contacted']
  );

  // set an initial persisted balance for demo user
  await pool.query(
    'INSERT INTO balances (user_id, amount) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET amount = EXCLUDED.amount',
    [userId, 24881.00]
  );

  // seed analytics metric snapshots
  await pool.query(
    'INSERT INTO analytics_metrics (user_id, period_label, revenue, new_leads, churn, avg_deal) VALUES ($1,$2,$3,$4,$5,$6)',
    [userId, 'weekly', 128450, 1240, 3.2, 9850]
  );
  await pool.query(
    'INSERT INTO analytics_metrics (user_id, period_label, revenue, new_leads, churn, avg_deal) VALUES ($1,$2,$3,$4,$5,$6)',
    [userId, 'monthly', 452300, 4310, 2.9, 10120]
  );

  console.log('Seed complete. Demo user: demo@smartbizz.ma / password123');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
