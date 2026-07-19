# Task Manager API

A simple RESTful Task Manager API built with **Node.js**, **Express.js**, and **Swagger UI** as part of the FlyRank Backend AI Engineering Internship assignment.

## Features

- Create a task
- Get all tasks
- Get a task by ID
- Update a task
- Delete a task
- Health check endpoint
- Interactive Swagger API documentation

## Technologies Used

- Node.js
- Express.js
- Swagger UI Express
- YAML

## Installation

Clone the repository:

```bash
git clone https://github.com/ZahidHussain775/task-manager-api.git
```

Go to the project directory:

```bash
cd task-manager-api
```

Install dependencies:

```bash
npm install
```

## Run the Application

```bash
npm start
```

The server will start at:

```
http://localhost:3000
```

## API Documentation

Swagger UI is available at:

```
http://localhost:3000/docs
```

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | / | Root endpoint |
| GET | /health | Health check |
| GET | /tasks | Get all tasks |
| GET | /tasks/:id | Get a task by ID |
| POST | /tasks | Create a new task |
| PUT | /tasks/:id | Update an existing task |
| DELETE | /tasks/:id | Delete a task |

## Example Request

### Create a Task

**POST** `/tasks`

```json
{
  "title": "Buy milk"
}
```

Response:

```json
{
  "id": 4,
  "title": "Buy milk",
  "done": false
}
```

## Project Structure

```
task-manager-api/
│── app.js
│── openapi.yaml
│── package.json
│── package-lock.json
├── README.md
└── .gitignore
```

## Author

**Zahid Hussain**

GitHub: https://github.com/ZahidHussain775