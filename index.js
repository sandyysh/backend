const express = require('express');
const cors = require('cors')
const path = require('path'); // Add this line to import the path module
const crypto = require('crypto');

const authRoutes = require("./routes/auth.js");

const app = express();
const PORT = process.env.PORT || 3002;

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const twilioClient = require('twilio')(accountSid, authToken);
const secretKey = crypto.randomBytes(32).toString('hex')

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/send-twilio-notification', (req, res) => {
    const { message, user: sender, type, members } = req.body;
    console.log("twilio1")
    if (type === 'message.new') {
        console.log("twilio2");
        console.log(members);
        console.log(typeof(members));
        console.log("====================");
    
        for (let key in members) {
            let user = members[key].user;
            console.log(user);
            if (user.id == sender.id){
                continue;
            }
            if (!user.online) {
                // const formattedPhoneNumber = `+65${user.phoneNumber}`;
                // const fromPhoneNumber = '+17622488820'
                console.log("Twillio call starts");
                twilioClient.messages.create({
                    body: `You have a new message from ${sender.fullName} - ${message}`,
                    messagingServiceSid: messagingServiceSid,
                    to: "+65" + user.phoneNumber
                    // from: fromPhoneNumber
                }).then(() => {
                    console.log(`Message sent to ${user.phoneNumber}`);
                }).catch((error) => {
                    console.log(`Error sending message to ${user.phoneNumber}:`, error);
                });
            }else{
                console.log("User is logged in")
            }
        }

        return res.status(200).send('Message sending process completed.');
    }

    return res.status(200).send('Not a new message request.');
});


app.use('/auth', authRoutes);
app.use(express.static(path.join(__dirname, "./client/build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname,"./client/build/index.html"))
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));