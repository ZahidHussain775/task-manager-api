const request = require("supertest");
const app = require("../app");
const db = require("../database/db");

beforeAll(async () => {
  await db.ready;
});

afterAll((done) => {
  db.close(done);
});

describe("General endpoints", () => {
  test("GET / returns API metadata", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      name: "Task API",
      version: "1.0",
      endpoints: ["/tasks"],
    });
  });

  test("GET /health returns ok status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /tasks", () => {
  test("returns the seeded tasks as an array", async () => {
    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);

    const titles = res.body.map((t) => t.title);
    expect(titles).toContain("Learn Express");
    expect(titles).toContain("Build CRUD API");
    expect(titles).toContain("Submit Assignment");
  });
});

describe("GET /tasks/:id", () => {
  test("returns a single task when it exists", async () => {
    const res = await request(app).get("/tasks/1");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, title: "Learn Express" });
  });

  test("returns 404 when the task does not exist", async () => {
    const res = await request(app).get("/tasks/99999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Task 99999 not found" });
  });
});

describe("POST /tasks", () => {
  test("creates a new task", async () => {
    const res = await request(app).post("/tasks").send({ title: "Write tests" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Write tests", done: 0 });
    expect(typeof res.body.id).toBe("number");

    const fetched = await request(app).get(`/tasks/${res.body.id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.title).toBe("Write tests");
  });

  test("returns 400 when title is missing", async () => {
    const res = await request(app).post("/tasks").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Title is required" });
  });

  test("returns 400 when title is only whitespace", async () => {
    const res = await request(app).post("/tasks").send({ title: "   " });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Title is required" });
  });
});

describe("PUT /tasks/:id", () => {
  test("updates the title of an existing task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Original title" });
    const id = created.body.id;

    const res = await request(app)
      .put(`/tasks/${id}`)
      .send({ title: "Updated title" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id, title: "Updated title", done: 0 });
  });

  test("updates the done flag (boolean coerced to 1)", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Toggle me" });
    const id = created.body.id;

    const res = await request(app).put(`/tasks/${id}`).send({ done: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id, title: "Toggle me", done: 1 });
  });

  test("returns 400 when the body is empty", async () => {
    const res = await request(app).put("/tasks/1").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Request body cannot be empty" });
  });

  test("returns 404 when the task does not exist", async () => {
    const res = await request(app)
      .put("/tasks/99999")
      .send({ title: "Nope" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Task 99999 not found" });
  });
});

describe("DELETE /tasks/:id", () => {
  test("deletes an existing task and returns 204", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Delete me" });
    const id = created.body.id;

    const res = await request(app).delete(`/tasks/${id}`);
    expect(res.status).toBe(204);

    const fetched = await request(app).get(`/tasks/${id}`);
    expect(fetched.status).toBe(404);
  });

  test("returns 404 when deleting a non-existent task", async () => {
    const res = await request(app).delete("/tasks/99999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Task 99999 not found" });
  });
});
