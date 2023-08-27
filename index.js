
const express = require('express');
const cors = require('cors');

const authRoutes = require("./routes/auth.js");

const app = express();
const PORT = process.env.PORT || 3002;

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const twilioClient = require('twilio')(accountSid, authToken);

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/', (req, res) => {
    const { message, user: sender, type, members } = req.body;
    console.log("twilio1")
    if (type === 'message.new') {
    console.log("twilio2")
        members
            .filter((member) => member.user_id !== sender.id)
            .forEach(({ user }) => {
                if (!user.online) {
                    const formattedPhoneNumber = `+65${user.phoneNumber}`;
                    const fromPhoneNumber = '+17622488820'


                    twilioClient.messages.create({
                        body: `You have a new message from ${message.user.fullName} - ${message.text}`,
                        messagingServiceSid: messagingServiceSid,
                        to: formattedPhoneNumber,
                        from: fromPhoneNumber
                    })
                    .then(() => {
                        console.log(`Message sent to ${formattedPhoneNumber}`);
                    })
                    .catch((error) => {
                        console.log(`Error sending message to ${formattedPhoneNumber}:`, error);
                    });
                }
            });

        return res.status(200).send('Message sending process completed.');
    }

    return res.status(200).send('Not a new message request.');
});


app.use('/auth', authRoutes);
app.use(express.static(path.join(__dirname, "./client/build")))

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname,"./client/build/index.html"))
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));