const express = require("express");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");
const db = require("./database/db");

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
    const id = parseInt(req.params.id);

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
    const id = parseInt(req.params.id);
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
    const id = parseInt(req.params.id);

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

const swaggerDocument = yaml.load("./openapi.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


if (require.main === module) {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}

module.exports = app;