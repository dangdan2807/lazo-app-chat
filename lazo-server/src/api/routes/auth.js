const router = require('express').Router();
const authController = require('../controllers/AuthController');

router.post('/login', authController.login);

module.exports = router;