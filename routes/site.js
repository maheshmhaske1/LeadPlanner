var express = require('express');
var router = express.Router();
const siteController = require('../controller/site')

router.post('/add', siteController.createSite)
router.put('/edit/:siteId', siteController.updateSite)
router.get('/get/:siteId', siteController.get)
router.get('/getAll', siteController.getAll)

module.exports = router;
