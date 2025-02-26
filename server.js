const express = require('express');
const mariadb = require('mariadb');
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 80;
// Create a MariaDB connection pool
const pool = mariadb.createPool({
    host: '127.0.0.1', // Use IP address to force TCP connection
    port: 3306, // Ensure this is the correct port user: 'your_username', // Replace with your MariaDB
    user: 'row0',
    password: 'password', // Replace with your MariaDB password
    database: 'hw2', // Our database name created above
    connectionLimit: 5
});

// Set EJS as the view engine and set the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use body-parser middleware to parse form data (if you prefer explicit usage)
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Alternatively, you can use Express's built-in parsing:
// app.use(express.urlencoded({ extended: true }));

// Route: Display form and customer table
app.get('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // Get all customers from the table
        const users = await conn.query('SELECT * FROM Users');
        res.render('index', { users });
    } catch (err) {
        res.status(500).send(`Error retrieving users: ${err}`);
    } finally {
        if (conn) conn.release();
    }
});

// Route: Add a new customer
app.post('/add', async (req, res) => {
    const username = req.body.username;
    // Generate a random balance between 100 and 10,000 (two decimal places)
    // const balance = (Math.random() * (10000 - 100) + 100).toFixed(2);
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('INSERT INTO Users(username) VALUES (?)', [username]);
        res.redirect('/');
    } catch (err) {
        res.status(500).send(`Error adding user: ${err}`);
    } finally {
        if (conn) conn.release();
    }
});

app.get('/greeting', async (req, res) => {
    res.send('hello world');
});

app.post('/register', async (req, res) => {
    const data = req.body;
    const username = data.username;

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('INSERT INTO Users(username) VALUES (?)', [username]);
    } catch (err) {
        res.status(500).send(`Error adding user: ${err}`);
    } finally {
        if (conn) conn.release();
    }

    axios.post('http://35.188.82.186/replicate-register', data)
        .then(response => { console.log("Replicated.") })
        .catch(error => console.error(error));
});

app.post('/replicate-register', async (req, res) => {
    const data = req.body;
    const username = data.username;

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('INSERT INTO Users(username) VALUES (?)', [username]);
        await conn.query(query);
        res.redirect('/');
    } catch (err) {
        res.status(500).send(`Error adding user: ${err}`);
    } finally {
        if (conn) conn.release();
    }
});

app.get('/list', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // Get all customers from the table
        let users = await conn.query('SELECT * FROM Users');
        users = users.map(user => user.username);
        res.json({ 'users': users });
    } catch (err) {
        res.status(500).send(`Error retrieving users: ${err}`);
    } finally {
        if (conn) conn.release();
    }
});

app.post('/clear', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = 'TRUNCATE TABLE Users;';
        await conn.query(query);
        res.redirect('/');
    } catch (err) {
        res.status(500).send(`Error clearing table Users: ${err}`);
    } finally {
        if (conn) conn.release();
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://104.197.227.149:${port}`);
});