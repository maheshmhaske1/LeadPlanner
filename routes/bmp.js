var express = require("express");
var router = express.Router();
const auth = require('../model/auth')
const { verifyBmpAdmin } = require('../model/auth')
const bmp = require('../controller/bmp')

router.post('/login', bmp.login)
router.post('/getUser', verifyBmpAdmin, bmp.getUser)

router.post('/academy/add', verifyBmpAdmin, bmp.addAcademyDetails)
router.get('/academy/get/:user_id', verifyBmpAdmin, bmp.getAcademyByOrg)
router.put('/academy/update/:academy_id', verifyBmpAdmin, bmp.updateAcademy)
router.post('/academy/batch/add', verifyBmpAdmin, bmp.addAcademyBatchDetails)
router.get('/academy/batch/get/:academy_id', verifyBmpAdmin, bmp.getAcademyBatchByAcademy)
router.put('/academy/batch/update/:batchId', verifyBmpAdmin, bmp.updateBatch)

// router.post('/cloudinary/createFolder', verifyBmpAdmin, bmp.createCloudinaryFolder)

// ============== LEAD APIS ============= //
router.get('/academy/leads/get/:academy_id/:object_type', verifyBmpAdmin, bmp.getAcademyLeads)

// ============== Reviews ============= //
router.post('/academy/getreviews', verifyBmpAdmin, bmp.getTotalReviews)
router.post('/academy/getreviewreply', verifyBmpAdmin, bmp.getReviewReply)
router.post('/academy/getreviewreport', verifyBmpAdmin, bmp.getReviewReport)



module.exports = router;
