import request from "supertest"; // Supertest lets us send HTTP requests directly to the Express app without starting a real server.
import dotenv from "dotenv"; // Load environment variables (needed for JWT_SECRET).
dotenv.config();
import app from "./app.js"; // The Express application under test.
import jwt from "jsonwebtoken"; // Used to generate a valid JWT token for protected-route tests.
import * as todoRepo from "./todoRepository.js"; // Changed from "./repository/todoRepository.js"

/**
 * Helper: generates a valid JWT token for use in authenticated requests.
 * The token is signed with the same JWT_SECRET the server uses, so the 'auth' middleware accepts it.
 * @param {string} email - Payload value; any string works for testing purposes.
 * @returns {string} A signed JWT token string.
 */
const getToken = (email = "student@example.com") =>
  jwt.sign({ email }, process.env.JWT_SECRET);

// --- Test isolation ---

// beforeEach runs before every individual test.
// Resetting the repository ensures each test starts with an empty task list,
// so tests cannot interfere with one another.
beforeEach(() => {
  todoRepo.reset();
});

// --- Test cases ---

/**
 * Test 1: GET / (fetch all tasks)
 * Goal: verify the endpoint returns HTTP 200 and a JSON array.
 */
test("1) GET / returns a list (200 + array)", async () => {
  // Send a GET request to '/'. request(app) routes it directly through Express.
  const res = await request(app).get("/");

  // The response status code must be 200 (OK).
  expect(res.status).toBe(200);

  // The response body must be a JavaScript array.
  expect(Array.isArray(res.body)).toBe(true);
});

/**
 * Test 2: POST /create without authentication
 * Goal: verify the endpoint is protected and returns 401 Unauthorized when no token is provided.
 */
test("2) POST /create without a token → 401", async () => {
  const res = await request(app)
    .post("/create")
    .send({ task: { description: "X" } }); // Send body data — the request should still be rejected.

  // Expect 401 because the 'auth' middleware blocks unauthenticated requests.
  expect(res.status).toBe(401);
});

/**
 * Test 3: POST /create with a valid token
 * Goal: verify that a task is created successfully and the response includes an 'id' field.
 */
test("3) POST /create with a token → 201 + id", async () => {
  const token = getToken(); // Generate a valid JWT for this request.

  const res = await request(app)
    .post("/create")
    .set("Authorization", token) // Set the Authorization header — this satisfies the 'auth' middleware.
    .send({ task: { description: "Test task" } });

  // 201 Created indicates the resource was successfully added to the in-memory store.
  expect(res.status).toBe(201);

  // The returned object must have an 'id' property assigned by the repository.
  expect(res.body).toHaveProperty("id");
});

/**
 * Test 4: POST /create with a valid token but missing body data
 * Goal: verify that the server rejects the request with 400 Bad Request when the description is absent.
 */
test("4) POST /create with missing data → 400", async () => {
  const token = getToken(); // A token is required so we test input validation, not authentication.

  const res = await request(app)
    .post("/create")
    .set("Authorization", token)
    .send({ task: null }); // Send deliberately incomplete data.

  // 400 Bad Request — the validation logic in the router rejects this.
  expect(res.status).toBe(400);

  // The error response body must include an 'error' property.
  expect(res.body).toHaveProperty("error");
});

/**
 * Test 5: Created task appears in GET /
 * Goal: verify that a task created via POST /create is returned by GET /.
 */
test("5) Created task appears in GET /", async () => {
  const token = getToken();
  const taskDescription = "Integration test task";

  // Step 1: Create a task
  const createRes = await request(app)
    .post("/create")
    .set("Authorization", token)
    .send({ task: { description: taskDescription } });

  expect(createRes.status).toBe(201);
  expect(createRes.body).toHaveProperty("id");

  // Step 2: Fetch all tasks
  const getRes = await request(app).get("/");

  expect(getRes.status).toBe(200);
  expect(Array.isArray(getRes.body)).toBe(true);

  // Step 3: Verify the created task is in the list
  expect(getRes.body).toHaveLength(1);
  expect(getRes.body[0].description).toBe(taskDescription);
});

/**
 * Test 6: POST /create with invalid token
 * Goal: verify that the authentication middleware rejects malformed or tampered tokens.
 */
test("6) POST /create with invalid token → 401", async () => {
  const res = await request(app)
    .post("/create")
    .set("Authorization", "invalid-token")
    .send({ task: { description: "Test task" } });

  // 401 Unauthorized — the token is invalid, so auth middleware rejects it.
  expect(res.status).toBe(401);
});

/**
 * Test 7: DELETE removes task
 * Goal: verify that a task can be deleted and no longer appears in GET /.
 */
test("7) DELETE removes task", async () => {
  const token = getToken();

  // Step 1: Create a task
  const createRes = await request(app)
    .post("/create")
    .set("Authorization", token)
    .send({ task: { description: "Task to delete" } });

  expect(createRes.status).toBe(201);
  const taskId = createRes.body.id;

  // Step 2: Delete the task
  const deleteRes = await request(app)
    .delete(`/${taskId}`)
    .set("Authorization", token);

  expect(deleteRes.status).toBe(204);

  // Step 3: Verify the task is gone
  const getRes = await request(app).get("/");

  expect(getRes.status).toBe(200);
  expect(getRes.body).toHaveLength(0);
});

/**
 * Test 8: DELETE unknown id → 404
 * Goal: verify that deleting a non-existent task returns 404.
 */
test("8) DELETE unknown id → 404", async () => {
  const token = getToken();

  const res = await request(app)
    .delete("/999")
    .set("Authorization", token);

  expect(res.status).toBe(404);
});

/**
 * Test 9: POST /create with too short description → 400
 * Goal: verify that the server rejects descriptions shorter than 3 characters.
 */
test("9) POST /create with too short description → 400", async () => {
  const token = getToken();

  const res = await request(app)
    .post("/create")
    .set("Authorization", token)
    .send({ task: { description: "A" } });

  // 400 Bad Request — the description is too short.
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("error");
});
