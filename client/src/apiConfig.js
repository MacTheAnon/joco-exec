const API_BASE = process.env.REACT_APP_API_URL;

// 2. Warn if it's missing (helps you debug)
if (!API_BASE) {
  console.warn("⚠️ API_BASE is not set! Defaulting to localhost.");
}

// 3. Export the logic so other files can use it
// If we are testing locally, use localhost. If in production, use the real URL.
export const API_URL = API_BASE || 'http://localhost:8080';