const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');

class EmailService {
    constructor() {
        // 1. Setup the OAuth2 Client
        this.oauth2Client = new google.auth.OAuth2(
            process.env.OAUTH_CLIENT_ID,
            process.env.OAUTH_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground' // Ensure this matches your Google Console Redirect URI
        );

        // 2. Set the Refresh Token
        this.oauth2Client.setCredentials({
            refresh_token: process.env.OAUTH_REFRESH_TOKEN
        });

        // 3. Initialize Gmail Instance
        this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    }

    /**
     * Sends an email using the Gmail API (OAuth2)
     * @param {Object} options - { email, subject, message, html }
     */
    async sendEmail(options) {
        try {
            // Structure the mail options to match your previous usage
            const mailOptions = {
                from: `${process.env.FROM_NAME || 'TaskFlow'} <${process.env.OAUTH_EMAIL}>`,
                to: options.email,
                subject: options.subject,
                text: options.message,
                html: options.html || options.message,
                textEncoding: 'base64'
            };

            // Compile the email content using MailComposer
            const mail = new MailComposer(mailOptions);
            const message = await mail.compile().build();

            // Encode the message to Base64 (Gmail API requirement)
            const rawMessage = Buffer.from(message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            // Execute the send request
            const result = await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: rawMessage
                }
            });

            console.log('Email sent successfully via Gmail API:', result.data.id);
            return result.data;
        } catch (error) {
            console.error('Error sending email through Gmail API:', error);
            throw new Error("Email sending failed");
        }
    }
}

// Export a single instance (Singleton)
module.exports = new EmailService();