const router = require('express').Router();
const commonInfoController = require('../controllers/CommonInfoController');

router.get('/web-info', commonInfoController.getWebInfo);

module.exports = router;
