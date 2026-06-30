// Vercel serverless function entry point.
// Catches all /api/* requests and hands them to the Express app.
// Express's own router does the path matching from req.url.
module.exports = require('../server/index.js');
