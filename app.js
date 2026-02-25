import express from "express"; // Import Express — the framework used to build the API.
import cors from "cors"; // Import CORS middleware — allows cross-origin requests from a browser.
import { router as todoRouter } from "./todoRouter.js"; // Import the Todo router that defines all API endpoints.

// --- Express application setup ---

const app = express(); // Create the Express application instance.

// Enable middleware that runs before route handlers.

// Allow cross-origin requests from any origin.
app.use(cors());

// Parse incoming JSON request bodies, making the data available via req.body.
app.use(express.json());

// --- Routing ---

// Attach the Todo router at the root path.
// All requests starting with '/' are handled by todoRouter.
app.use("/", todoRouter);

// --- Error-handling middleware ---

// Express identifies error handlers by the four-argument signature: (err, req, res, next).
// If any route or middleware calls next(error), execution jumps here.
app.use((err, req, res, next) => {
  // Use the error's status code if available, otherwise default to 500 (Internal Server Error).
  const status = err?.status || 500;

  // Send a JSON error response back to the client.
  res.status(status).json({ error: { message: err.message, status } });
});

// --- Module export ---

export default app; // Export the configured app so it can be imported by server.js and test files.
