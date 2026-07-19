# Task Manager API

A simple RESTful Task Manager API built with **Node.js**, **Express.js**, and **Swagger UI** as part of the **FlyRank Backend AI Engineering Internship** assignment.

---

## Features

- Create a new task
- Get all tasks
- Get a task by ID
- Update an existing task
- Delete a task
- Health check endpoint
- Interactive Swagger API documentation
- Input validation with proper HTTP status codes

---

## Technologies Used

- Node.js
- Express.js
- Swagger UI Express
- YAML (OpenAPI 3.0)

---

## Installation

### Clone the repository

```bash
git clone https://github.com/ZahidHussain775/task-manager-api.git
```

### Navigate to the project directory

```bash
cd task-manager-api
```

### Install dependencies

```bash
npm install
```

---

## Run the Application

Start the server:

```bash
npm start
```

The server will run on:

```
http://localhost:3000
```

---

## API Documentation

Interactive Swagger documentation is available at:

```
http://localhost:3000/docs
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get a task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update an existing task |
| DELETE | `/tasks/:id` | Delete a task |

---

## Example curl Request

### Health Check

```bash
curl -i http://localhost:3000/health
```

### Example Response

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"ok"}
```

---

## Example Request

### Create a Task

**POST** `/tasks`

Request Body

```json
{
  "title": "Buy milk"
}
```

Response

```json
{
  "id": 4,
  "title": "Buy milk",
  "done": false
}
```

---

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Resource deleted successfully |
| 400 | Invalid request or validation failed |
| 404 | Resource not found |

---

## Project Structure

```
task-manager-api/
│
├── app.js
├── openapi.yaml
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
└── swagger.jpg
```

---

## Swagger UI Screenshot

> Save your screenshot as **swagger.jpg** in the project root.

![Swagger UI](swagger.jpg)

---

## Sample Task Object

```json
{
  "id": 1,
  "title": "Learn Express",
  "done": false
}
```

---

## Author

**Zahid Hussain**

GitHub: https://github.com/ZahidHussain775

---

## Assignment

This project was developed as part of the **FlyRank Backend AI Engineering Internship** to demonstrate:

- Building a RESTful API using Express.js
- CRUD operations
- Request validation
- Proper HTTP status codes
- OpenAPI (Swagger) documentation
- Git and GitHub workflow