const router = require('express').Router();
const UserController = require('../controllers/UserController');

router.get('/search/username/:username', UserController.getByUsername);

module.exports = router;