const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, "data", "todos.json");

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Utility functions
function getTodos() {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

function saveTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// GET all todos
app.get("/api/todos", (req, res) => {
  const todos = getTodos();
  res.json(todos);
});

// POST new todo
app.post("/api/todos", (req, res) => {
  try {
    const todos = getTodos();
    const newTodo = {
      id: Date.now().toString(),
      title: req.body.title,
      priority: req.body.priority || "medium",
      completed: false,
    };
    todos.push(newTodo);
    saveTodos(todos);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: "Server error while adding todo" });
  }
});

// PUT (update) todo
app.put("/api/todos/:id", (req, res) => {
  const todos = getTodos();
  const index = todos.findIndex(todo => todo.id === req.params.id);
  if (index !== -1) {
    todos[index] = {
      ...todos[index],
      ...req.body,
    };
    saveTodos(todos);
    res.json(todos[index]);
  } else {
    res.status(404).json({ error: "Todo not found" });
  }
});

// DELETE todo
app.delete("/api/todos/:id", (req, res) => {
  const todos = getTodos();
  const updatedTodos = todos.filter(todo => todo.id !== req.params.id);
  saveTodos(updatedTodos);
  res.status(204).end();
});

// Serve frontend build (for deployment)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
