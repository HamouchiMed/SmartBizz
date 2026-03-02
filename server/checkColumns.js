const pool = require('./db');
(async () => {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='messages'");
    const cols = res.rows.map(r => r.column_name);
    console.log('existing columns:', cols);
    const needed = [
      'type',
      'dealId',
      'from',
      'text',
      'time',
      'image',
      'documentName'
    ];
    for (const col of needed) {
      if (!cols.includes(col)) {
        console.log('adding missing column', col);
        let sql;
        switch(col) {
          case 'type':
            sql = "ALTER TABLE messages ADD COLUMN \"type\" TEXT DEFAULT 'text'";
            break;
          case 'dealId':
            sql = "ALTER TABLE messages ADD COLUMN \"dealId\" INTEGER REFERENCES deals(id) ON DELETE CASCADE";
            break;
          case 'from':
            sql = "ALTER TABLE messages ADD COLUMN \"from\" TEXT DEFAULT 'client'";
            break;
          case 'text':
            sql = "ALTER TABLE messages ADD COLUMN \"text\" TEXT";
            break;
          case 'time':
            sql = "ALTER TABLE messages ADD COLUMN \"time\" TEXT";
            break;
          case 'image':
            sql = "ALTER TABLE messages ADD COLUMN \"image\" TEXT";
            break;
          case 'documentName':
            sql = "ALTER TABLE messages ADD COLUMN \"documentName\" TEXT";
            break;
          default:
            continue;
        }
        await pool.query(sql);
      }
    }
    const res2 = await pool.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='messages'");
    console.log('updated columns:', res2.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();
