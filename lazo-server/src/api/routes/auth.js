const router = require('express').Router();
const authController = require('../controllers/AuthController');

router.post('/login', authController.login);
router.post('/registry', authController.registry);

module.exports = router;