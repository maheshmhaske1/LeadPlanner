var express = require('express');
var router = express.Router();
const dealController = require('../controller/deal')

router.post('/add', dealController.createLead)
router.put('/edit/:dealId', dealController.updateLead)
router.get('/get/:dealId', dealController.get)
router.get('/getall', dealController.getAll)

module.exports = router;
