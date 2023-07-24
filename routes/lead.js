var express = require('express');
var router = express.Router();
const SQL = require('../model/sqlhandler')
const multer = require('multer');

const leadController = require('../controller/lead')
const upload = multer({ dest: '/public/leadcsv/' });
const { verifyToken } = require('../model/auth')

router.post('/add', verifyToken, leadController.createLead)
router.put('/edit/:leadId', verifyToken, leadController.updateLead)
router.get('/get/:leadId', verifyToken, leadController.get)
router.get('/getall', verifyToken, leadController.getAll)
router.post('/importcsv', verifyToken, upload.single('file'), leadController.importLead)
router.delete('/movetotrash', verifyToken, leadController.moveLeadToTrash)
router.post('/restorefromtrash', verifyToken, leadController.restoreLeadFromTrash)
router.post('/restoreallfromtrash', verifyToken, leadController.restoreAllLeadFromTrash)
router.get('/getallfromtrash', verifyToken, leadController.getAllLeadFromTrash)
router.delete('/deletefromtrash', verifyToken, leadController.deleteLeadFromTrash)
router.delete('/deleteallfromtrash', verifyToken, leadController.deleteAllLeadFromTrash)


module.exports = router;

