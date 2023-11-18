var express = require("express");
var router = express.Router();
const auth = require('../model/auth')
const { verifyBmpAdmin, verifyBmpAdminOrBmpAcademyManager } = require('../model/auth')
const bmp = require('../controller/bmp')

router.post('/login', bmp.login)
router.post('/getUser', verifyBmpAdminOrBmpAcademyManager, bmp.getUser)

router.post('/academy/add', verifyBmpAdminOrBmpAcademyManager, bmp.addAcademyDetails)
router.get('/academy/get/:user_id', verifyBmpAdminOrBmpAcademyManager, bmp.getAcademyByOrg)
router.put('/academy/update/:academy_id', verifyBmpAdminOrBmpAcademyManager, bmp.updateAcademy)
router.post('/batch/add', verifyBmpAdminOrBmpAcademyManager, bmp.addBatchDetails)
router.post('/batch/get', verifyBmpAdminOrBmpAcademyManager, bmp.getBatch)
router.put('/batch/update/:batchId', verifyBmpAdminOrBmpAcademyManager, bmp.updateBatch)

// router.post('/cloudinary/createFolder', verifyBmpAdminOrBmpAcademyManager, bmp.createCloudinaryFolder)
router.post('/academy/getnearbylocations', bmp.getNearbyLocations)

// ============== LEAD APIS ============= //
router.get('/academy/leads/get/:academy_id/:object_type', verifyBmpAdminOrBmpAcademyManager, bmp.getAcademyLeads)

// ============== Reviews ============= //
router.post('/academy/getreviews', bmp.getTotalReviews)
router.post('/academy/review/reply', verifyBmpAdminOrBmpAcademyManager, bmp.addReviewReply)
router.post('/academy/getreviewreply', verifyBmpAdminOrBmpAcademyManager, bmp.getReviewReply)
router.post('/academy/getreviewreport', verifyBmpAdminOrBmpAcademyManager, bmp.getReviewReport)

// ============== awards ============= //
router.post('/academy/award/add', verifyBmpAdminOrBmpAcademyManager, bmp.createAward)
router.post('/academy/award/getall', bmp.getAllAwards)
router.get('/academy/award/get/:id', bmp.getAwardById)
router.put('/academy/award/update/:id', verifyBmpAdminOrBmpAcademyManager, bmp.updateAward)

// ============= admin apis ============ //
router.post('/academy/getall', verifyBmpAdminOrBmpAcademyManager, bmp.getAllAcademy)
router.post('/academy/getupdatedinfo', verifyBmpAdminOrBmpAcademyManager, bmp.getUpdatedAcademyInfo)
router.put('/academy/updateupdatedinfo/:id', verifyBmpAdminOrBmpAcademyManager, bmp.updateUpdatedAcademyInfo)
router.post('/academy/addupdaterequest', verifyBmpAdminOrBmpAcademyManager, bmp.addUpdateAcademyRequest)
router.post('/academy/getrequesthistory', verifyBmpAdminOrBmpAcademyManager, bmp.getAcademyRequestHistory)


module.exports = router;
