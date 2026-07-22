const sqlite3 = require("sqlite3").verbose();

const dbFile =
  process.env.NODE_ENV === "test"
    ? ":memory:"
    : process.env.DB_PATH || "./database/tasks.db";

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.ready = new Promise((resolve, reject) => {
  db.serialize(() => {
    db.run(
      `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
          return reject(err);
        }

        console.log("Tasks table is ready.");

        db.get("SELECT COUNT(*) AS count FROM tasks", (err, row) => {
          if (err) {
            console.error(err.message);
            return reject(err);
          }

          console.log("Current tasks:", row.count);

          if (row.count === 0) {
            const insert = db.prepare(`
    INSERT INTO tasks (title, done)
    VALUES (?, ?)
  `);

            insert.run("Learn Express", 0);
            insert.run("Build CRUD API", 0);
            insert.run("Submit Assignment", 1);

            insert.finalize((err) => {
              if (err) {
                return reject(err);
              }
              console.log("Sample tasks inserted.");
              resolve();
            });
          } else {
            resolve();
          }
        });
      }
    );
  });
});

module.exports = db;
