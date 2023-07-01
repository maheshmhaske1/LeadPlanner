var express = require('express');
var router = express.Router();
var { uploadImg } = require('../model/upload')
const employeeController = require('../controller/employee')

// router.post('/uploadImg', uploadImg("employeeDoc"))
router.post('/uploadDoc', employeeController.uploadDoc)
router.post('/login', employeeController.login)
router.delete('/removeDoc/:docName', employeeController.removeDoc)
router.post('/add', employeeController.createEmployee)
router.put('/edit/:employeeId', employeeController.updateEmployee)
router.get('/get/:employeeId', employeeController.getEmployee)
router.get('/getAll', employeeController.getAll)
router.get('/getPayslips/:employeeId', employeeController.getPayslips)
router.get('/getPayslip/:payslipId', employeeController.getPayslip)
router.get('/payslipPdf/:payslipId', employeeController.generatePaysipPdf)


module.exports = router;
