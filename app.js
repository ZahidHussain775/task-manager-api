const express = require("express");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");
const db = require("./database/db");

const app = express();
app.use(express.json());

// Parses and validates a `:id` route param. Returns a positive integer, or
// null when the value is not a valid id so callers can respond with 400
// instead of silently querying with NaN.
function parseId(raw) {
    if (!/^\d+$/.test(raw)) {
        return null;
    }
    const id = Number(raw);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}


app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  });
});


app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.get("/tasks", (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });    
});

app.get("/tasks/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({
            error: "Task id must be a positive integer"
        });
    }

    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        res.json(row);
    });
});


app.post("/tasks", (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    db.run(
        "INSERT INTO tasks (title, done) VALUES (?, ?)",
        [title, 0],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                id: this.lastID,
                title,
                done: 0
            });
        }
    );
});

app.put("/tasks/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({
            error: "Task id must be a positive integer"
        });
    }

    const { title, done } = req.body;

    if (title === undefined && done === undefined) {
        return res.status(400).json({
            error: "Request body cannot be empty"
        });
    }

    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, task) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (!task) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        const updatedTitle = title !== undefined ? title : task.title;
        const updatedDone = done !== undefined ? (done ? 1 : 0) : task.done;

        db.run(
            "UPDATE tasks SET title = ?, done = ? WHERE id = ?",
            [updatedTitle, updatedDone, id],
            function (err) {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    id,
                    title: updatedTitle,
                    done: updatedDone
                });
            }
        );
    });
});

app.delete("/tasks/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({
            error: "Task id must be a positive integer"
        });
    }

    db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        res.status(204).send();
    });
});

try {
    const swaggerDocument = yaml.load("./openapi.yaml");
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
    // Docs are non-critical; log and keep serving the API rather than
    // crashing the whole process on a malformed/missing spec.
    console.error("Failed to load OpenAPI docs:", err.message);
}

// Unknown routes get a consistent JSON 404 instead of the default HTML page.
app.use((req, res) => {
    res.status(404).json({
        error: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Centralized error handler. Without it, errors such as malformed JSON bodies
// leak an HTML stack trace (exposing internal file paths) to clients.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            error: "Invalid JSON in request body"
        });
    }

    console.error("Unhandled request error:", err);
    res.status(err.status || 500).json({
        error: "Internal server error"
    });
});

const server = app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

server.on("error", (err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
});

// Surface programming errors that would otherwise be silently swallowed by
// Node's default handlers and leave the process in an undefined state.
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    process.exit(1);
});