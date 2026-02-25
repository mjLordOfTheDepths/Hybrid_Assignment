import jwt from "jsonwebtoken"; // Import jsonwebtoken — used to verify JWT tokens attached to requests.

/**
 * Authentication middleware.
 *
 * Protects API routes by checking for a valid JWT token before the route handler runs.
 *
 * @param {object} req  - Express request object. Contains information about the incoming request.
 * @param {object} res  - Express response object. Used to send responses back to the client.
 * @param {function} next - Calls the next middleware or route handler in the chain.
 */
export const auth = (req, res, next) => {
  // 1. Read the token from the request headers.
  // The token is expected in the 'Authorization' header (without a 'Bearer ' prefix in this implementation).
  const token = req.headers["authorization"];

  // 2. Reject immediately if no token was provided.
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // 3. Verify the token.
  // jwt.verify() decodes and validates the token using the secret key.
  // If the token is expired, tampered with, or signed with a different key, it returns an error.
  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    // 4. Handle a failed verification.
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }

    // 5. Token is valid — pass control to the next handler.
    next();
  });
};
