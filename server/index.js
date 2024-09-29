const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");

// Initialize Express App
dotenv.config();
const app = express();
const port = process.env.localPort || 5000;

// CORS Middleware Configuration
const allowedOrigins = ['https://task4-frontend-sage.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If you need to include credentials like cookies
}));
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.user, // Use your MySQL username
  password: process.env.password, // Use your MySQL password
  database: process.env.database
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected...');
});

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Register Route
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hash], (err, result) => {
      if (err) return res.status(400).json({ error: err });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Fetch user from database
  const sqlSelect = 'SELECT * FROM users WHERE email = ?';
  db.query(sqlSelect, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    // Check if account is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Account is blocked' });
    }

    // Compare passwords
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Update last login time
      const sqlUpdate = 'UPDATE users SET last_login_time = NOW() WHERE id = ?';
      db.query(sqlUpdate, [user.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error updating last login time' });
        }

        // Generate token and send response
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      });
    });
  });
});



// Fetch Users Route (admin only)
app.get('/api/users', authenticateToken, (req, res) => {
  const sql = 'SELECT id, name, email, status, registration_time, last_login_time FROM users';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


// Block User Route
app.put('/api/block/:id', authenticateToken, (req, res) => {
  const { id } = req.params; // Extract user ID from URL parameters
  const sql = 'UPDATE users SET status = "blocked" WHERE id = ?'; // SQL query to update user status

  db.query(sql, [id], (err, result) => {
    // Error handling
    if (err) {
      console.error('Error executing query', err); // Log the error for debugging
      return res.status(500).json({ error: 'Database query failed' });
    }
    
    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or already blocked' });
    }

    res.json({ message: 'User blocked successfully' }); // Send success response
  });
});


// Unblock User Route
app.put('/api/unblock/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE users SET status = "active" WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'User unblocked' });
  });
});

// Delete User Route
app.delete('/api/delete/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'User deleted' });
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
