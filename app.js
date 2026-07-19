const express = require("express");

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

app.get("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id === id);
    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }
    res.json(task);
});

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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});