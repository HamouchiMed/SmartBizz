const pool = require('./db');
(async () => {
  try {
    const res = await pool.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='contacts'");
    console.log('contacts columns:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();
