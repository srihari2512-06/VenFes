import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './services/socketService.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL || true,
    credentials: true
  }
});

// Socket.io Authentication Middleware (FR-28, S6)
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
  if (!token) {
    // Permit guest connection for public storefront, but no privileged rooms
    socket.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  if (socket.user) {
    if (socket.user.role === 'admin') {
      socket.join('admin_room');
    } else if (socket.user.role === 'vendor') {
      socket.join(`vendor_${socket.user.id}`);
    }
  }

  socket.on('disconnect', () => {});
});

initSocket(io);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[WARN] Port ${env.PORT} busy. Retrying in 1s...`);
    setTimeout(() => {
      try { server.close(); } catch {}
      server.listen(env.PORT, '0.0.0.0', () => {
        console.log(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
      });
    }, 1000);
  } else {
    console.error('Server error:', err);
  }
});

// Start server
async function start() {
  try {
    await connectDB();
    console.log('Connected to MongoDB successfully');

    // Auto-seed initial catalog if database is empty so products are immediately available
    try {
      const { Product } = await import('./models/Product.js');
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('[INFO] No products found in database. Automatically seeding demo catalog...');
        const { seedDatabase } = await import('./seed.js');
        await seedDatabase();
      } else {
        console.log(`[INFO] Catalog ready with ${count} products.`);
      }
    } catch (seedErr) {
      console.warn('[WARN] Auto-seed check failed:', seedErr.message);
    }
  } catch (err) {
    console.warn(`[WARN] MongoDB connection failed (${err.message}). Server started, but database operations will require MongoDB running at ${env.MONGODB_URI}.`);
  }
  server.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

// In test environment, export without listening automatically
if (process.env.NODE_ENV !== 'test') {
  start();
}

function handleSignal() {
  try { server.close(); } catch {}
  process.exit(0);
}
process.on('SIGINT', handleSignal);
process.on('SIGTERM', handleSignal);

export { server, io };
