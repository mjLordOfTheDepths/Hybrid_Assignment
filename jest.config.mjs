// jest.config.mjs — Jest configuration for the teaching edition.

export default {
  // Run tests in a Node.js environment (no browser DOM needed for API testing).
  // Use 'jsdom' instead if you were testing frontend/browser code.
  testEnvironment: "node",

  // Disable source transformation.
  // Node.js natively supports ES Modules (import/export), so Babel is not required.
  // This keeps the setup simple and speeds up test runs.
  transform: {},

  // Only pick up files ending in '.test.js' as test files.
  // Example match: 'app.int.test.js', 'todoRouter.test.js'.
  testMatch: ["**/*.test.js"]
};
