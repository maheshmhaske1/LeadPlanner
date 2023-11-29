var express = require("express");
var router = express.Router();
const auth = require('../model/auth')
const { verifyBmpAdmin, verifyBmpAdminOrBmpAcademyManager,verifyBlogger } = require('../model/auth')
const bmp = require('../controller/bmp')
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/login', bmp.login)
router.post('/getUser', verifyBmpAdminOrBmpAcademyManager, bmp.getUser)

router.post('/academy/add', verifyBmpAdminOrBmpAcademyManager, bmp.addAcademyDetails)
router.get('/academy/get/:user_id', verifyBmpAdminOrBmpAcademyManager, bmp.getAcademyByOrg)
router.put('/academy/update/:academy_id', verifyBmpAdminOrBmpAcademyManager, bmp.updateAcademy)
router.post('/batch/add', verifyBmpAdminOrBmpAcademyManager, bmp.addBatchDetails)
router.post('/batch/get', verifyBmpAdminOrBmpAcademyManager, bmp.getBatch)
router.put('/batch/update/:batchId', verifyBmpAdminOrBmpAcademyManager, bmp.updateBatch)

// router.post('/cloudinary/createFolder', verifyBmpAdminOrBmpAcademyManager, bmp.createCloudinaryFolder)
router.post('/cloudinary/uploadmedia', upload.array('images', 4), bmp.uploadMedia)
router.post('/academy/getnearbylocations', bmp.getNearbyLocations)
router.post('/academy/getlocationsbyaddress', bmp.getNearbyLocationsByAddress)
router.post('/academy/getcoordinate', bmp.getLngLatByAddress)

// ============== LEAD APIS ============= //
router.get('/academy/leads/get/:academy_id/:object_type', verifyBmpAdminOrBmpAcademyManager, bmp.getAcademyLeads)

// ============== Reviews ============= //
router.post('/academy/getreviews', bmp.getTotalReviews)
router.post('/academy/getreviewsbytype', bmp.getAllReviewsByType)
router.put('/academy/review/update/:review_id', auth.verifyToken, bmp.updateReview)
router.post('/academy/review/reply', bmp.addReviewReply)
router.post('/academy/getreviewreply', bmp.getReviewReply)
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

// ============== League Apis ============= //
router.post('/league/add', verifyBlogger,bmp.createLeague)
router.get('/league/getall',verifyBlogger, bmp.getAllLeague)
router.get('/league/get/:id',verifyBlogger, bmp.getLeagueById)
router.put('/league/update/:id', verifyBlogger,bmp.updateLeague)

module.exports = router;
