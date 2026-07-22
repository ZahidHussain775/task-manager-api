# Task Manager API

A RESTful Task Manager API built with **Node.js**, **Express.js**, **PostgreSQL**, **Docker**, and **Swagger UI** as part of the **FlyRank Backend AI Engineering Internship**.

The project demonstrates how to build a CRUD API using PostgreSQL for persistent storage while containerizing the entire application with Docker and documenting the API using OpenAPI (Swagger).

---

# Features

- Create a new task
- Get all tasks
- Get a task by ID
- Update an existing task
- Delete a task
- Health check endpoint
- Persistent task storage using PostgreSQL
- Automatic database and table creation
- Automatic insertion of sample tasks on first run
- Dockerized application
- Docker Compose support
- Interactive Swagger API documentation
- Input validation with proper HTTP status codes

---

# Technologies Used

- Node.js
- Express.js
- PostgreSQL
- pg
- Docker
- Docker Compose
- Swagger UI Express
- OpenAPI 3.0 (YAML)
- dotenv

---

# Why PostgreSQL?

PostgreSQL was chosen because it is one of the most popular open-source relational databases used in production applications.

Benefits include:

- Reliable and production-ready
- Supports SQL and advanced database features
- Scales much better than SQLite
- Stores data permanently
- Easy to integrate with Docker
- Widely used in backend development

---

# Why Docker?

Docker packages the application and its dependencies into containers so the project runs the same on every machine.

Benefits include:

- No manual PostgreSQL installation required
- Same development environment for everyone
- Easy project setup
- Isolated services
- Data persistence using Docker volumes
- Entire application starts with a single command

---

# Installation

## Clone the repository

```bash
git clone https://github.com/ZahidHussain775/task-manager-api.git
```

## Navigate into the project

```bash
cd task-manager-api
```

## Install dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=taskdb
```

A `.env.example` file is included in the repository.

---

# Running with Docker

Build and start the complete application:

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up -d
```

Stop the application:

```bash
docker compose down
```

Stop and remove all data (including the PostgreSQL volume):

```bash
docker compose down -v
```

---

# Running Without Docker

If PostgreSQL is already installed locally:

```bash
npm start
```

or

```bash
node app.js
```

The application will be available at:

```
http://localhost:3000
```

---

# Database

The project uses **PostgreSQL** as the database.

When the application starts it automatically:

- Creates the `tasks` table if it does not exist.
- Inserts three sample tasks only when the table is empty.
- Connects using environment variables.

Because PostgreSQL uses a Docker volume, data remains available even after restarting the containers.

---

# Docker Architecture

```
                Docker Compose
                      │
        ┌─────────────┴─────────────┐
        │                           │
   Node.js App                 PostgreSQL
   (Express API)               Database
        │                           │
        └──────────────┬────────────┘
                       │
                 Docker Network
```

---

# API Documentation

Swagger UI is available at:

```
http://localhost:3000/docs
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get task by ID |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

---

# Example Requests

## Create Task

**POST** `/tasks`

Request Body

```json
{
  "title": "Learn Docker"
}
```

Response

```json
{
  "id": 4,
  "title": "Learn Docker",
  "done": false
}
```

---

## Get All Tasks

**GET** `/tasks`

Example Response

```json
[
  {
    "id": 1,
    "title": "Learn Express",
    "done": false
  },
  {
    "id": 2,
    "title": "Build CRUD API",
    "done": false
  },
  {
    "id": 3,
    "title": "Submit Assignment",
    "done": true
  }
]
```

---

# HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Resource Created |
| 204 | Resource Deleted |
| 400 | Bad Request |
| 404 | Task Not Found |
| 500 | Internal Server Error |

---

# Example SQL Queries

Get all tasks

```sql
SELECT * FROM tasks;
```

Get completed tasks

```sql
SELECT * FROM tasks WHERE done = true;
```

Count all tasks

```sql
SELECT COUNT(*) FROM tasks;
```

Update all tasks

```sql
UPDATE tasks SET done = true;
```

Delete completed tasks

```sql
DELETE FROM tasks WHERE done = true;
```

---

# Project Structure

```
task-manager-api/
│
├── database/
│   └── postgres.js
│
├── app.js
├── docker-compose.yml
├── Dockerfile
├── openapi.yaml
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── README.md
└── screenshots/
    ├── swagger.png
    └── docker.png
```

---

# Screenshots

## Swagger UI

Save the screenshot as:


screenshots/swagger.jpg


markdown
![Swagger UI](screenshots/swagger.jpg)


---

## Docker Containers

Save a screenshot from Docker Desktop as:


screenshots/docker.png

markdown
![Docker Containers](screenshots/docker.png)


---

# Persistence Test

The following steps were performed to verify database persistence:

1. Started the application using Docker Compose.
2. Created new tasks using the API.
3. Restarted both the application and PostgreSQL containers.
4. Retrieved tasks using `GET /tasks`.
5. Verified that all previously created tasks were still present.

This confirms that PostgreSQL data is stored inside a Docker volume and survives container restarts.

---

# Future Improvements

- JWT Authentication
- User Accounts
- Search Tasks
- Pagination
- Filtering & Sorting
- Redis Caching
- Unit Testing
- GitHub Actions CI/CD
- Deployment with Docker
- Kubernetes Support

---

# Author

**Zahid Hussain**

GitHub:

https://github.com/ZahidHussain775

---

# Assignment

This project was completed as part of the **FlyRank Backend AI Engineering Internship**.

The project demonstrates:

- RESTful API development
- CRUD operations
- PostgreSQL integration
- SQL queries
- Docker containerization
- Docker Compose
- Persistent storage
- Environment variables
- Automatic database initialization
- Swagger (OpenAPI) documentation
- Git & GitHub workflow