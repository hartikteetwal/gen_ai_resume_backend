const nodemailer = require('nodemailer');

async function sendMail() {
    // 1. Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
        host: "://example.com", // Replace with your SMTP server
        port: 587,                // 587 for TLS, 465 for SSL
        secure: false,            // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS,      // Your email password or App Password
        },
    });

    // 2. Set up email data
    let mailOptions = {
        from: '"Sender Name" <your_email@example.com>',
        to: "receiver@example.com",
        subject: "Hello from Node.js",
        text: "This is a plain text email.",
        html: "<b>This is an HTML email.</b>",
    };

    // 3. Send the email
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent successfully: %s", info.messageId);
    } catch (error) {
        console.error("Error occurred while sending mail:", error);
    }
}