var express = require('express');
var router = express.Router();
const SQL = require('../model/sqlhandler')
const multer = require('multer');

const leadController = require('../controller/lead')
const upload = multer({ dest: '/public/leadcsv/' });

router.post('/add', leadController.createLead)
router.put('/edit/:leadId', leadController.updateLead)
router.get('/get/:leadId', leadController.get)
router.get('/getall', leadController.getAll)
router.post('/importcsv', upload.single('file'), leadController.importLead)


module.exports = router;

