const express = require('express');
const siteController = require('../app/api/v1/controllers/site.controller');
const router = express.Router();

router.use('/docs', siteController.docs);
router.use('/insert-db', siteController.insertDb);
router.use('/', siteController.home);

module.exports = router;