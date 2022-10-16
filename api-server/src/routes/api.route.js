const express = require('express');
const authController = require('../app/api/v1/controllers/auth.controller');
const authRoute = require('./auth.route');
const router = express.Router();

router.use('/auth', authRoute);

module.exports = router;