var express = require("express");
var router = express.Router();
const auth = require('../model/auth')
const { verifyBmpAdmin } = require('../model/auth')
const bmp = require('../controller/bmp')

router.post('/academy/add', verifyBmpAdmin, bmp.addAcademyDetails)
router.get('/academy/get/:org_id', verifyBmpAdmin, bmp.getAcademyByOrg)
router.put('/academy/update/:academy_id', verifyBmpAdmin, bmp.updateAcademy)
router.post('/academy/batch/add', verifyBmpAdmin, bmp.addAcademyBatchDetails)
router.get('/academy/batch/get/:academy_id', verifyBmpAdmin, bmp.getAcademyBatchByAcademy)
router.put('/academy/batch/update/:batchId', verifyBmpAdmin, bmp.updateBatch)

module.exports = router;