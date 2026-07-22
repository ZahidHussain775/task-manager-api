const express = require("express");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");
const db = require("./database/db");
const { sendError, handleDbError, sendNotFound } = require("./utils/responses");

const app = express();
app.use(express.json());



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
        if (handleDbError(res, err)) return;

        res.json(rows);
    });    
});

app.get("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);

    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
        if (handleDbError(res, err)) return;

        if (!row) {
            return sendNotFound(res, id);
        }

        res.json(row);
    });
});


app.post("/tasks", (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === "") {
        return sendError(res, 400, "Title is required");
    }

    db.run(
        "INSERT INTO tasks (title, done) VALUES (?, ?)",
        [title, 0],
        function (err) {
            if (handleDbError(res, err)) return;

            res.status(201).json({
                id: this.lastID,
                title,
                done: 0
            });
        }
    );
});

app.put("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { title, done } = req.body;

    if (title === undefined && done === undefined) {
        return sendError(res, 400, "Request body cannot be empty");
    }

    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, task) => {
        if (handleDbError(res, err)) return;

        if (!task) {
            return sendNotFound(res, id);
        }

        const updatedTitle = title !== undefined ? title : task.title;
        const updatedDone = done !== undefined ? (done ? 1 : 0) : task.done;

        db.run(
            "UPDATE tasks SET title = ?, done = ? WHERE id = ?",
            [updatedTitle, updatedDone, id],
            function (err) {
                if (handleDbError(res, err)) return;

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
    const id = parseInt(req.params.id);

    db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
        if (handleDbError(res, err)) return;

        if (this.changes === 0) {
            return sendNotFound(res, id);
        }

        res.status(204).send();
    });
});

const swaggerDocument = yaml.load("./openapi.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});