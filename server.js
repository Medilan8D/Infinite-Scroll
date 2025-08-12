const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456', // Use the password you set above
    database: 'infinite_scroll_db'
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
    console.log('API server running on http://localhost:3000');
});