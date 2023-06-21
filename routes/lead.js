var express = require('express');
var router = express.Router();
const leadController = require('../controller/lead')

// router.post('/add', employeeController.createEmployee)
// router.put('/edit/:employeeId', employeeController.updateEmployee)
router.get('/get/:leadId', leadController.get)
router.get('/getAll', leadController.getAll)

module.exports = router;
