const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yaswanthpg9@gmail.com', 
        pass: 'bigmixvfocxidpme'       // Your App Password
    }
});

// Email Service
router.post('/send-email', async (req, res) => {
    const { to, subject, text, html } = req.body;

    // Email options
    const mailOptions = {
        from: '"Your Name" <yaswanthpg9@gmail.com>', // Sender's name and email
        to: to,                                     // Recipient email
        subject: subject,                           // Email subject
        text: text,                                 // Plain text body
        html: html                                  // HTML body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Email sent successfully', info: info.response });
    } catch (error) {
        console.error('Error while sending email:', error);
        res.status(500).json({ message: 'Error while sending email', error: error.message });
   }
});

module.exports = router;


// Base route for testing the API
router.get('/', (req, res) => {
    res.status(200).json({ message: ' service is running' });
});

module.exports = router;
