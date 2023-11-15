var express = require("express");
var router = express.Router();
const auth = require('../model/auth')
const { verifyBmpAdmin, verifyBmpAdminOrBmpAcademyManager } = require('../model/auth')
const bmp = require('../controller/bmp')

router.post('/login', bmp.login)
router.post('/getUser', verifyBmpAdmin, bmp.getUser)

router.post('/academy/add', verifyBmpAdmin, bmp.addAcademyDetails)
router.get('/academy/get/:user_id', verifyBmpAdmin, bmp.getAcademyByOrg)
router.put('/academy/update/:academy_id', verifyBmpAdmin, bmp.updateAcademy)
router.post('/batch/add', verifyBmpAdmin, bmp.addBatchDetails)
router.post('/batch/get', verifyBmpAdmin, bmp.getBatch)
router.put('/batch/update/:batchId', verifyBmpAdmin, bmp.updateBatch)

// router.post('/cloudinary/createFolder', verifyBmpAdmin, bmp.createCloudinaryFolder)
router.post('/academy/getnearbylocations', bmp.getNearbyLocations)

// ============== LEAD APIS ============= //
router.get('/academy/leads/get/:academy_id/:object_type', verifyBmpAdmin, bmp.getAcademyLeads)

// ============== Reviews ============= //
router.post('/academy/getreviews', bmp.getTotalReviews)
router.post('/academy/review/reply', verifyBmpAdmin, bmp.addReviewReply)
router.post('/academy/getreviewreply', verifyBmpAdmin, bmp.getReviewReply)
router.post('/academy/getreviewreport', verifyBmpAdmin, bmp.getReviewReport)

// ============== awards ============= //
router.post('/academy/award/add', verifyBmpAdmin, bmp.createAward)
router.post('/academy/award/getall', bmp.getAllAwards)
router.get('/academy/award/get/:id', bmp.getAwardById)
router.put('/academy/award/update/:id', verifyBmpAdmin, bmp.updateAward)

// ============= admin apis ============ //
router.post('/academy/getall', verifyBmpAdminOrBmpAcademyManager, bmp.getAllAcademy)
router.post('/academy/getupdatedinfo', verifyBmpAdminOrBmpAcademyManager, bmp.getUpdatedAcademyInfo)
router.put('/academy/updateupdatedinfo/:id', verifyBmpAdminOrBmpAcademyManager, bmp.updateUpdatedAcademyInfo)
router.post('/academy/addupdaterequest', verifyBmpAdminOrBmpAcademyManager, bmp.addUpdateAcademyRequest)


module.exports = router;
