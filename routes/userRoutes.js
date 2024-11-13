const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();
const router = express.Router();

// Database connection
const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// Helper function to send email (forgot password)
const sendMail = (email, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    return transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject, text });
};

// Registration Route
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
    ],
    upload.single('profileImage'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, email, password } = req.body;
        const profileImage = req.file ? `/uploads/${req.file.filename}` : '';

        try {
            const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
            if (existingUser.length > 0) return res.status(400).json({ msg: 'User already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);
            await db.execute('INSERT INTO users (name, email, password, profile) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, profileImage]);

            const [newUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
            const payload = { user: { id: newUser[0].id } };
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0 || !(await bcrypt.compare(password, user[0].password))) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user[0].id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Request body:', req.body);
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) return res.status(400).json({ msg: 'User not found' });

        const resetToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetUrl = `http://localhost:5000/api/users/reset-password/${resetToken}`;
        
        // Send reset email
        await sendMail(email, 'Password Reset', `Reset your password using this link: ${resetUrl}`);
        
        res.json({ msg: 'Password reset email sent' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);
        
        res.json({ msg: 'Password successfully updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update Profile Route
router.put('/update-profile', upload.single('profileImage'), async (req, res) => {
    const { name, email } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : '';

    try {
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) return res.status(400).json({ msg: 'User not found' });

        await db.execute('UPDATE users SET name = ?, profile = ? WHERE email = ?', [name || user[0].name, profileImage || user[0].profile, email]);

        res.json({ userDetails: { name: name || user[0].name, email, profile: profileImage || user[0].profile } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


router.post('/palindrome', (req, res) => {
    const str = req.body.str;
    let j = str.length - 1;
    let isPalindrome = true;

    for (let i = 0; i < j / 2; i++) {
        let x = str[i];        
        let y = str[j - i];    
        if (x !== y) {
          isPalindrome = false;       
        }
    }
res.json({result: isPalindrome });
});


router.post('/unique-Countduplicates', (req, res) => {
    const arr = req.body.array;
    const countMap = {};
    const uniqueValues = [];
    const duplicates = [];

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];

        if (countMap[item]) {
            countMap[item]++;
        } else {
            countMap[item] = 1;
        }
    }

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];

        if (countMap[item] === 1 && uniqueValues.indexOf(item) === -1) {
            uniqueValues.push(item);  
        } else if (countMap[item] > 1 && duplicates.indexOf(item) === -1) {
            duplicates.push(item);  
        }
    }

    res.json({
        uniqueValues: uniqueValues,
        duplicateCount: duplicates.length
    });
});


module.exports = router;
