var express = require('express');
var router = express.Router();
const employeeController = require('../controller/employee.controller')

router.post('/add',employeeController.createEmployee)
router.put('/edit/:employeeId',employeeController.updateEmployee)

module.exports = router;
