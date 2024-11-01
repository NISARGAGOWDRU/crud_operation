const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool configuration
const pool = new Pool({
    user: process.env.USER_NAME,
    host: process.env.HOST_NAME,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
// Enable CORS for all routes
app.use(cors());

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine and static files (if you plan to render views)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Create users table if it doesn't exist
const createUsersTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE
        );
    `;
    await pool.query(query);
};

// Initialize the database
createUsersTable();

// Handle GET request to fetch all users
app.get('/users', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM users');
        res.json(data.rows); // Respond with JSON data
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Handle POST request to add a user
app.post('/users', async (req, res) => {
    const { name, email } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *", 
            [name, email]
        );
        res.status(201).json(result.rows[0]); // Respond with the created user
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle PUT request to update a user
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    try {
        const result = await pool.query(
            "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *", 
            [name, email, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result.rows[0]); // Respond with the updated user
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle DELETE request to delete a user
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING *", 
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
