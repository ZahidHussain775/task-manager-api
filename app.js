const express = require("express");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");
const db = require("./database/db");

const app = express();
app.use(helmet());
app.use(express.json({ limit: "16kb" }));

const MAX_TITLE_LENGTH = 255;

// Optional API-key protection for mutating routes.
// When API_KEY is set, POST/PUT/DELETE require a matching `x-api-key` header.
// When unset, the guard is a no-op so local/dev usage keeps working.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn(
    "API_KEY is not set. Mutating endpoints are unauthenticated. " +
      "Set the API_KEY environment variable to require the x-api-key header."
  );
}

function requireApiKey(req, res, next) {
  if (!API_KEY) {
    return next();
  }

  const provided = req.get("x-api-key");
  if (!provided || provided !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

function parseTaskId(value) {
  if (!/^\d+$/.test(String(value))) {
    return null;
  }
  const id = Number.parseInt(value, 10);
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
            console.error("GET /tasks failed:", err.message);
            return res.status(500).json({
                error: "Internal server error"
            });
        }

        res.json(rows);
    });    
});

app.get("/tasks/:id", (req, res) => {
    const id = parseTaskId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            error: "Task id must be a positive integer"
        });
    }

    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
        if (err) {
            console.error("GET /tasks/:id failed:", err.message);
            return res.status(500).json({
                error: "Internal server error"
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


app.post("/tasks", requireApiKey, (req, res) => {
    const { title } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required and must be a non-empty string"
        });
    }

    if (title.length > MAX_TITLE_LENGTH) {
        return res.status(400).json({
            error: `Title must be at most ${MAX_TITLE_LENGTH} characters`
        });
    }

    const cleanTitle = title.trim();

    db.run(
        "INSERT INTO tasks (title, done) VALUES (?, ?)",
        [cleanTitle, 0],
        function (err) {
            if (err) {
                console.error("POST /tasks failed:", err.message);
                return res.status(500).json({
                    error: "Internal server error"
                });
            }

            res.status(201).json({
                id: this.lastID,
                title: cleanTitle,
                done: 0
            });
        }
    );
});

app.put("/tasks/:id", requireApiKey, (req, res) => {
    const id = parseTaskId(req.params.id);

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

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
        return res.status(400).json({
            error: "Title must be a non-empty string"
        });
    }

    if (title !== undefined && title.length > MAX_TITLE_LENGTH) {
        return res.status(400).json({
            error: `Title must be at most ${MAX_TITLE_LENGTH} characters`
        });
    }

    if (done !== undefined && typeof done !== "boolean") {
        return res.status(400).json({
            error: "Done must be a boolean"
        });
    }

    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, task) => {
        if (err) {
            console.error("PUT /tasks/:id failed:", err.message);
            return res.status(500).json({
                error: "Internal server error"
            });
        }

        if (!task) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        const updatedTitle = title !== undefined ? title.trim() : task.title;
        const updatedDone = done !== undefined ? (done ? 1 : 0) : task.done;

        db.run(
            "UPDATE tasks SET title = ?, done = ? WHERE id = ?",
            [updatedTitle, updatedDone, id],
            function (err) {
                if (err) {
                    console.error("PUT /tasks/:id failed:", err.message);
                    return res.status(500).json({
                        error: "Internal server error"
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

app.delete("/tasks/:id", requireApiKey, (req, res) => {
    const id = parseTaskId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            error: "Task id must be a positive integer"
        });
    }

    db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
        if (err) {
            console.error("DELETE /tasks/:id failed:", err.message);
            return res.status(500).json({
                error: "Internal server error"
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

const swaggerDocument = yaml.load("./openapi.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});