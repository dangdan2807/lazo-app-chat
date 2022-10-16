const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function connect() {
    try {
        const URL = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DB_NAME}?retryWrites=true&w=majority`;
        await mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
        });
        console.log('connected to db');
    } catch (error) {
        console.log('error connecting');
    }
}

module.exports = { connect };
