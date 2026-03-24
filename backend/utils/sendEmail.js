const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // We will use a mockup transport or real test credentials. For local testing, Ethereal Mail is great, or fake it entirely if no service is given. Console log the link as fallback.
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_EMAIL || 'testuser123',
            pass: process.env.SMTP_PASSWORD || 'testpass123',
        },
    });

    const message = {
        from: `${process.env.FROM_NAME || 'Student Note Books'} <${process.env.FROM_EMAIL || 'noreply@studentnotebooks.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Note: If using fake ethereal credentials, this might fail unless valid. 
    // In our local dev environment, we'll try to send and catch + log the URL so we can test it without real email.
    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        // If ethereal
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Email could not be routed:', error);
        // To ensure dev works, we'll just log the message contents if SMTP is not configured
        console.log("----- MOCK EMAIL SENT -----");
        console.log("TO:", options.email);
        console.log("SUBJECT:", options.subject);
        console.log("BODY:\n", options.message);
        console.log("---------------------------");
    }
};

module.exports = sendEmail;
