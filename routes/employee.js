var express = require('express');
var router = express.Router();
var { uploadImg } = require('../model/upload')
const employeeController = require('../controller/employee')

// router.post('/uploadImg', uploadImg("employeeDoc"))
router.post('/uploaddoc', employeeController.uploadDoc)
router.post('/login', employeeController.login)
router.delete('/removeDoc/:docName', employeeController.removeDoc)
router.post('/add', employeeController.createEmployee)
router.put('/edit/:employeeId', employeeController.updateEmployee)
router.get('/get/:employeeId', employeeController.getEmployee)
router.get('/getall', employeeController.getAll)
router.get('/getpayslips/:employeeId', employeeController.getPayslips)
router.get('/getpayslip/:payslipId', employeeController.getPayslip)


module.exports = router;
