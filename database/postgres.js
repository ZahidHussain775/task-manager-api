const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function connectDB() {
    try {
            await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                done BOOLEAN DEFAULT FALSE
            );
        `);

               const result = await pool.query("SELECT COUNT(*) FROM tasks");

            if (parseInt(result.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO tasks (title, done)
                VALUES
                ('Learn Express', false),
                ('Build CRUD API', false),
                ('Submit Assignment', true);
            `);

            console.log("✅ Sample tasks inserted");
        }

        console.log("✅ Connected to PostgreSQL");
        console.log("✅ Tasks table is ready");

    } catch (err) {
        console.error(err);
    }
}

connectDB();

module.exports = pool;