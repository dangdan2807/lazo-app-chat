const express = require("express");
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const cors = require("cors");

const app = express();
dotenv.config();
const POST = process.env.POST || 3001;

// template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/resource/views'));
app.use(express.static(path.join(__dirname, '/public')))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));
app.use(cors());

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const route = require('./routes/index.route');
const db = require('./config/db.config');
db.connect();

// router init
route(app);

app.listen(POST, () => {
    console.log(`Server is running on http://localhost:${POST}`);
});