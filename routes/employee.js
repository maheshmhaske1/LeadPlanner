var express = require('express');
var router = express.Router();
var { uploadImg } = require('../model/upload')
const employeeController = require('../controller/employee')
const { verifyToken } = require('../model/auth')

router.post('/uploaddoc', verifyToken, employeeController.uploadDoc)
router.post('/login', verifyToken, employeeController.login)
router.delete('/removeDoc/:docName', verifyToken, employeeController.removeDoc)
router.post('/add', verifyToken, employeeController.createEmployee)
router.put('/edit/:employeeId', verifyToken, employeeController.updateEmployee)
router.post('/get', verifyToken, employeeController.getEmployee)
router.get('/getall', verifyToken, employeeController.getAll)
router.get('/getpayslips', verifyToken, employeeController.getPayslips)
router.get('/getpayslip/:payslipId', verifyToken, employeeController.getPayslip)


module.exports = router;
