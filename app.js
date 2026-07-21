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

    const newTask = {
        id: tasks.length + 1,
        title,
        done: false
    };

    tasks.push(newTask);
    res.status(201).json(newTask);

});

app.put("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { title, done } = req.body;

    const task = tasks.find(t => t.id === id);
    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }
    if (title === undefined && done === undefined) {
        return res.status(400).json({
            error: "Request body cannot be empty"
        });
    }
    if (title !== undefined) {
        if (title.trim() === "") {
            return res.status(400).json({
                error: "Title is required"
            });
        }

        task.title = title;
    }
    if (done !== undefined) {
        if (typeof done !== "boolean") {
            return res.status(400).json({
                error: "Done must be true or false"
            });
        }

        task.done = done;
    }
    res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    tasks.splice(index, 1);
    res.status(204).send();
});


const swaggerDocument = yaml.load("./openapi.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});