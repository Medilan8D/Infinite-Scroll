const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'picturistic_db'
});

// Multer setup for image uploads
const upload = multer({ dest: 'uploads/' });

// JWT secret
const JWT_SECRET = 'your_jwt_secret';

// User registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// User login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token });
    });
});

// Image upload
app.post('/upload', upload.single('image'), (req, res) => {
    const { title } = req.body;
    const imagePath = req.file.path;
    db.query('INSERT INTO images (title, path) VALUES (?, ?)', [title, imagePath], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Fetch images
app.get('/images', (req, res) => {
    db.query('SELECT * FROM images', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Like an image
app.post('/images/:id/like', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE images SET likes = likes + 1 WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Add a comment
app.post('/images/:id/comment', (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    db.query('INSERT INTO comments (image_id, comment) VALUES (?, ?)', [id, comment], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// GET /reviews?image_id=...
app.get('/reviews', (req, res) => {
    const { image_id } = req.query;
    db.query('SELECT * FROM review WHERE image_id = ?', [image_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || {});
    });
});

// POST /reviews/comment
app.post('/reviews/comment', (req, res) => {
    const { image_id, comment } = req.body;
    db.query(
        'UPDATE review SET comments = CONCAT(IFNULL(comments, ""), ?) WHERE image_id = ?',
        [`\n${comment}`, image_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// POST /reviews/like
app.post('/reviews/like', (req, res) => {
    const { image_id } = req.body;
    db.query(
        'UPDATE review SET likes = likes + 1 WHERE image_id = ?',
        [image_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// POST /reviews/view
app.post('/reviews/view', (req, res) => {
    const { image_id } = req.body;
    db.query(
        'UPDATE review SET views = views + 1 WHERE image_id = ?',
        [image_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// POST /reviews (create new review row for an image)
app.post('/reviews', (req, res) => {
    const { image_id } = req.body;
    db.query('INSERT INTO review (image_id) VALUES (?)', [image_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId });
    });
});

// GET /reviews/all (list all reviews)
app.get('/reviews/all', (req, res) => {
    db.query('SELECT * FROM review', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});