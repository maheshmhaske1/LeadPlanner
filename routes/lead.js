var express = require('express');
var router = express.Router();
const SQL = require('../model/sqlhandler')
const multer = require('multer');

const leadController = require('../controller/lead')
const upload = multer({ dest: '/public/leadcsv/' });
const { verifyToken } = require('../model/auth')

router.post('/add', verifyToken, leadController.createLead)
router.put('/edit', verifyToken, leadController.updateLead)
router.get('/get/:leadId', verifyToken, leadController.get)
router.get('/getall', verifyToken, leadController.getAll)
router.get('/getbyowner/:userId', verifyToken, leadController.getLeadByOwner)
router.post('/importcsv', verifyToken, upload.single('file'), leadController.importLead)
router.delete('/movetotrash', verifyToken, leadController.moveLeadToTrash)
router.post('/restorefromtrash', verifyToken, leadController.restoreLeadFromTrash)
router.get('/getallfromtrash', verifyToken, leadController.getAllLeadFromTrash)
router.delete('/deletefromtrash', verifyToken, leadController.deleteLeadFromTrash)
router.get('/exporttocsv', verifyToken, leadController.exportLeadsInCsv)
router.get('/gettablestructure/:tableName', verifyToken, leadController.getLeadDealColumnNames)
router.post('/changecoloumns', verifyToken, leadController.renameLeadDealField)
router.get('/getleaddealactivefields/:tableName', verifyToken, leadController.getAllEnabledFieldsFromLeadDeal)
router.post('/activatedeactivateleaddealfield/:tableName/:fieldName/:is_active', verifyToken, leadController.activateDeactivateTableField)
router.post('/sendleaddealemail', verifyToken, leadController.sendEmailToLeadDeal)
router.post('/getleaddealsentemail', verifyToken, leadController.getLeadDealsentEmail)



module.exports = router;

