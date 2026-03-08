const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Use Ethereal for testing or User-provided SMTP
    // For "free", Ethereal is best unless user provides Gmail credentials.

    let transporter;

    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    } else {
        // Fallback to Ethereal 
        // Usually need await nodemailer.createTestAccount();
        // But let's log to console as well for dev ease.
        const testAccount = await nodemailer.createTestAccount();
        console.log(`Ethereal Email created: ${testAccount.user} / ${testAccount.pass}`);

        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    }

    const message = {
        from: `${process.env.FROM_NAME || 'TaskFlow'} <${process.env.FROM_EMAIL || 'noreply@taskflow.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message, // Plain text body
        html: options.html, // HTML body
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error sending email: ", err);
        throw new Error("Email sending failed");
    }
};

module.exports = sendEmail;
