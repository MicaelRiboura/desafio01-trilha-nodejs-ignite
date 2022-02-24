const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  if (!user) {
    return response.status(400).send({ error: "Invalid username" });
  }

  request.user = user;

  return next();
}

function checksTodoExists(request, response, next) {
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find((t) => t.id === id);
  if (!todo) {
    return response.status(404).send({ error: "Invalid todo ID" });
  }
  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
   const { name, username } = request.body;

  const user = users.find((u) => u.username === username);
  if (user) {
    return response.status(400).send({ error: "User already exists" });
  }

  const newUser = { id: uuidv4(), name, username, todos: [] };
  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;
  todo.title = title;
  todo.deadline = deadline;
  return response.status(201).send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { todo } = request;
  todo.done = true;
  return response.status(201).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { user, todo } = request;
  user.todos.splice(user.todos.indexOf(todo), 1);
  return response.status(204).send(user.todos);
});

module.exports = app;