const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/database');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

dotenv.config();

const app = express();

// CORS configuration - Allow frontend (port 3000) to communicate with backend
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000','https://lmss-4b21.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  req.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://laundry-management-wir4.onrender.com';
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/quality', require('./routes/quality'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/compliance', require('./routes/compliance'));

// Initialize DB
// async function initDB() {
//   try {
//     const schema = fs.readFileSync(path.join(__dirname, 'config/schema.sql'), 'utf8');
//     const statements = schema.split(';').filter(s => s.trim());
//     for (const stmt of statements) {
//       if (stmt.trim()) await pool.execute(stmt);
//     }
//     console.log('✅ Database initialized');
//   } catch (err) {
//     console.error('DB init error:', err.message);
//   }
// }



const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  // await initDB();
});
