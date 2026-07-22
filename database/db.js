const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/tasks.db", (err) => {
  if (err) {
    // A failed connection leaves every route broken, so fail fast instead of
    // running the server in an unusable state.
    console.error("Error connecting to database:", err.message);
    process.exit(1);
  }

  console.log("Connected to SQLite database.");

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
        process.exit(1);
      }

      console.log("Tasks table is ready.");
      seedSampleTasks();
    }
  );
});

function seedSampleTasks() {
  db.get("SELECT COUNT(*) AS count FROM tasks", (err, row) => {
    if (err) {
      console.error("Error counting tasks:", err.message);
      return;
    }

    console.log("Current tasks:", row.count);

    if (row.count !== 0) {
      return;
    }

    const insert = db.prepare(
      `
        INSERT INTO tasks (title, done)
        VALUES (?, ?)
      `,
      (err) => {
        if (err) {
          console.error("Error preparing seed statement:", err.message);
        }
      }
    );

    const samples = [
      ["Learn Express", 0],
      ["Build CRUD API", 0],
      ["Submit Assignment", 1]
    ];

    for (const [title, done] of samples) {
      insert.run(title, done, (err) => {
        if (err) {
          console.error(`Error inserting seed task "${title}":`, err.message);
        }
      });
    }

    insert.finalize((err) => {
      if (err) {
        console.error("Error finalizing seed statement:", err.message);
        return;
      }
      console.log("Sample tasks inserted.");
    });
  });
}

module.exports = db;
