const express = require("express");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");

const pool = require("./database/postgres");
const app = express();
app.use(express.json());


let tasks = [
  {
    id: 1,
    title: "Learn Express",
    done: false
  },
  {
    id: 2,
    title: "Build CRUD API",
    done: false
  },
  {
    id: 3,
    title: "Submit Assignment",
    done: true
  }
];



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

app.get("/tasks", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM tasks ORDER BY id");

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

app.get("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const result = await pool.query(
            "SELECT * FROM tasks WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});


app.post("/tasks", async (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    try {
        const result = await pool.query(
            "INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *",
            [title, false]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

app.put("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, done } = req.body;

    if (title === undefined && done === undefined) {
        return res.status(400).json({
            error: "Request body cannot be empty"
        });
    }

    if (title !== undefined && title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    if (done !== undefined && typeof done !== "boolean") {
        return res.status(400).json({
            error: "Done must be true or false"
        });
    }

    try {
        // Check if task exists
        const existing = await pool.query(
            "SELECT * FROM tasks WHERE id = $1",
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        const task = existing.rows[0];

        const updatedTitle = title !== undefined ? title : task.title;
        const updatedDone = done !== undefined ? done : task.done;

        const result = await pool.query(
            `UPDATE tasks
             SET title = $1, done = $2
             WHERE id = $3
             RETURNING *`,
            [updatedTitle, updatedDone, id]
        );

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});
app.delete("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        res.status(204).send();

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

const swaggerDocument = yaml.load("./openapi.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});