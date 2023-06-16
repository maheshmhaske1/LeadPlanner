var express = require('express');
var router = express.Router();
const employeeController = require('../controller/employee.controller')

router.post('/add', employeeController.createEmployee)
router.put('/edit/:employeeId', employeeController.updateEmployee)
router.get('/get/:employeeId', employeeController.getEmployee)
router.get('/getAll', employeeController.getAll)

module.exports = router;
