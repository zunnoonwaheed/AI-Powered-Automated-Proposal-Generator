// Vercel serverless function wrapper
import('../dist/index.cjs').then(module => {
  module.default || module;
});

// Export the Express app for Vercel
export default async function handler(req, res) {
  // Import the built server
  const app = await import('../dist/index.cjs');

  // Let Express handle the request
  return app.default(req, res);
}
