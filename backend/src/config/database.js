const sql = require('mssql');
require('dotenv').config();

// Support full connection string or individual credentials
const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '1433', 10),
    options: {
        encrypt: true,              // Required for Azure SQL
        trustServerCertificate: false,
        enableArithAbort: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
};

let pool = null;

/**
 * Returns a singleton connection pool.
 */
async function getPool() {
    if (pool) return pool;
    try {
        if (connectionString) {
            pool = await sql.connect(connectionString);
        } else {
            pool = await sql.connect(dbConfig);
        }
        console.log('✅ Connected to Azure SQL Database');
        return pool;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        throw err;
    }
}

module.exports = { getPool, sql };
