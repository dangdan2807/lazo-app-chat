const mongoose = require('mongoose');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
async function connect() {
    try {
        await mongoose.connect(DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
            retryWrites: true,
        });

        console.log('Mongodb connect success');
    } catch (error) {
        console.log('Mongodb connect failed');
    }
}

module.exports = { connect };
