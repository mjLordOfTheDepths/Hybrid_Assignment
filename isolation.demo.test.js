/**
 * isolation.demo.test.js
 *
 * CLASSROOM DEMO — Test Isolation with beforeEach
 * -----------------------------------------------
 * This file demonstrates what happens when tests share mutable state inside
 * a single Jest run WITHOUT resetting it between tests.
 *
 * HOW TO USE THIS DEMO IN CLASS:
 *
 *   STEP 1 — Comment out the beforeEach block below, then run:
 *            npm test
 *            → Test 2 FAILS: the task created in test 1 is still in memory.
 *
 *   STEP 2 — Uncomment the beforeEach block, then run:
 *            npm test
 *            → All tests PASS: each test starts with a clean, empty store.
 *
 * WHY THIS WORKS:
 *   Within a single Jest run, all tests inside the same file share one
 *   instance of todoRepository (ESM module singleton). Without reset(),
 *   side effects from earlier tests are visible to later ones.
 *
 * WHY RUNNING npm test TWICE DOES NOT ACCUMULATE STATE:
 *   Each `npm test` invocation starts a brand-new Node.js process
 *   (different PID). All in-memory state is lost when the process exits.
 *   There is no persistence mechanism — no file, no database, no shared
 *   memory — so the second run always starts with tasks = [].
 *   See /docs/why-state-does-not-accumulate.md for the full explanation.
 */

import request from "supertest";
import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import jwt from "jsonwebtoken";
import * as todoRepo from "./todoRepository.js"; // Changed from "./repository/todoRepository.js"

// --- Instrumentation: observe process identity and module identity ---
// Uncomment these console.log lines to see them in test output.
// They prove that each npm test run is a different OS process, and that
// within a run all tests here share the exact same module instance.
//
// console.log("Process PID      :", process.pid);
// console.log("Timestamp        :", new Date().toISOString());
// console.log("Repository module:", import.meta.url);
// console.log("Tasks at startup :", todoRepo.getAll());

const getToken = () =>
  jwt.sign({ email: "demo@example.com" }, process.env.JWT_SECRET);

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE THIS BLOCK to switch between "broken" and "correct" behaviour:
// ─────────────────────────────────────────────────────────────────────────────
beforeEach(() => {
  todoRepo.reset(); // Comment this out (and the braces) to see test 2 fail.
});
// ─────────────────────────────────────────────────────────────────────────────

describe("Isolation demo", () => {
  /**
   * Test 1: Creates one task via POST /create.
   * Side effect: the in-memory store now contains 1 item.
   */
  test("DEMO 1 — POST /create adds a task to the store", async () => {
    const res = await request(app)
      .post("/create")
      .set("Authorization", getToken())
      .send({ task: { description: "Demo task" } });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");

    // Optional: log the store state after this test to observe the side effect.
    // console.log("Store after DEMO 1:", todoRepo.getAll());
  });

  /**
   * Test 2: Checks that GET / returns an EMPTY array.
   *
   * WITHOUT beforeEach(reset):
   *   The task inserted in test 1 is still in memory → array has 1 item → FAILS.
   *   Jest output: "Expected length: 0, Received length: 1"
   *
   * WITH beforeEach(reset):
   *   The store is cleared before this test runs → array is empty → PASSES.
   */
  test("DEMO 2 — GET / returns an empty list (fails without reset)", async () => {
    // Optional: log the store state at the start of this test.
    // console.log("Store at start of DEMO 2:", todoRepo.getAll());

    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    // This is the key assertion: it expects a fresh, empty store.
    // It will FAIL if test 1's side effect has not been cleaned up.
    expect(res.body).toHaveLength(0);
  });
});
