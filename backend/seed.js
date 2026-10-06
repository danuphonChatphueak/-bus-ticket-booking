const fs = require('fs');
const path = require('path');
const { getPool, sql } = require('./src/config/database');

async function seed() {
    try {
        const pool = await getPool();
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        // Some mssql driver setups don't support multi-statement well if there are GOs,
        // but since schema.sql doesn't have GOs, we just run the whole thing.
        // Wait, mssql .query() will execute everything.
        await pool.request().query(schema);
        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
}

seed();
