const router = require('express').Router();
const classifyController = require('../controllers/ClassifyController');

router.get('/colors', classifyController.getListColors);

module.exports = router;
