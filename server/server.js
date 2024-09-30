const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");

// Initialize Express App
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(`mongodb+srv://root:0nY6eLRokTwa6Hes@cluster0.7g8ue.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

// JWT Secret Key
const JWT_SECRET = 'my_secret_key';

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    status: { type: String, default: 'active' },
    registration_time: { type: Date, default: Date.now },
    last_login_time: Date
});

const User = mongoose.model('User', userSchema);

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

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

// Register Route
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hash });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check if account is blocked
        if (user.status === 'blocked') {
            return res.status(403).json({ error: 'Account is blocked' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Update last login time
        user.last_login_time = new Date();
        await user.save();

        // Generate token and send response
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        return res.status(500).json({ error: 'Database error' });
    }
});

// Fetch Users Route (admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({}, 'id name email status registration_time last_login_time');
        res.json(users);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Block User Route
app.put('/api/block/:id', authenticateToken, async (req, res) => {
    const { id } = req.params; // Extract user ID from URL parameters

    try {
        const result = await User.updateOne({ _id: id }, { status: 'blocked' });
        if (result.nModified === 0) {
            return res.status(404).json({ error: 'User not found or already blocked' });
        }
        res.json({ message: 'User blocked successfully' });
    } catch (err) {
        console.error('Error executing query', err); // Log the error for debugging
        return res.status(500).json({ error: 'Database query failed' });
    }
});

// Unblock User Route
app.put('/api/unblock/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await User.updateOne({ _id: id }, { status: 'active' });
        res.json({ message: 'User unblocked' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete User Route
app.delete('/api/delete/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await User.deleteOne({ _id: id });
        res.json({ message: 'User deleted' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
