const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ storage: storage });

// Helper function to send email (forgot password)
const sendMail = (email, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: text
    };

    return transporter.sendMail(mailOptions);
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
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
    
        try {
            const profileImage = req.file ? `/uploads/${req.file.filename}` : '';
    
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                name,
                email,
                password: hashedPassword,
                profile: profileImage
            });

            await user.save();

            const payload = { user: { id: user.id } };
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) throw err;
                res.json({token : token });
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

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({token: token });
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
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const resetUrl = `http://localhost:5000/api/users/reset-password/${resetToken}`;

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
        let user = await User.findById(decoded.id);

        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ msg: 'Password successfully updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Update Profile Route
router.put('/update-profile', upload.single('profileImage'), async (req, res) => {
    try {
        const { name, email } = req.body;
        const profileImage = req.file ? `/uploads/${req.file.profile}` : '';
    
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        if (profileImage && user.profile) {
            const oldImagePath = path.join(__dirname, '..', user.profile); 
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);  
            }
        }

        const updatedUser = await User.findOneAndUpdate(
            { email }, 
            { $set: { name, profile: profileImage } }, 
            { new: true } 
        );

        res.json({ userDetails: updatedUser });  
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