var express = require('express');
var router = express.Router();
const leadController = require('../controller/lead')

router.post('/add', leadController.createLead)
router.put('/edit/:leadId', leadController.updateLead)
router.get('/get/:leadId', leadController.get)
router.get('/getAll', leadController.getAll)

module.exports = router;
