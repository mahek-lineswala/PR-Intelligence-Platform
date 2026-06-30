const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const dotenv = require('dotenv');

dotenv.config();

const { getRedisClient } = require('./services/redis');
const authRoutes = require('./routes/auth');
const repoRoutes = require('./routes/repos');
const metricsRoutes = require('./routes/metrics');

const app = express();

// Trust Vercel's proxy so secure cookies work behind HTTPS termination.
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());

// Session store: Redis in production, in-memory fallback for local dev.
const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
};

const redisClient = getRedisClient();
if (redisClient) {
  sessionOptions.store = new RedisStore({
    client: redisClient,
    prefix: 'pri:sess:'
  });
} else {
  console.warn(
    '[session] using in-memory store — sessions will not persist across ' +
    'serverless invocations. Set REDIS_URL for production.'
  );
}

app.use(session(sessionOptions));

app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/metrics', metricsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', redis: !!(redisClient && redisClient.isReady) });
});

// Only listen when run directly (local dev). On Vercel, the app is
// imported as a serverless function and must NOT call listen().
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
