var express = require('express');
var router = express.Router();
const dealController = require('../controller/deal')
const { verifyToken } = require('../model/auth')
const { uploadDealLeadDoc } = require('../model/upload')


router.post('/add', verifyToken, dealController.createDeal)
router.post('/import', verifyToken, dealController.importDeal)
router.put('/edit', verifyToken, dealController.updateDeal)
router.get('/get/:dealId', verifyToken, dealController.get)
router.get('/getall', verifyToken, dealController.getAll)
router.get('/getbyowner/:userId', verifyToken, dealController.getDealByOwner)

router.delete('/movetotrash', verifyToken, dealController.moveDealToTrash)
router.post('/restorefromtrash', verifyToken, dealController.restoreDealFromTrash)
router.post('/getallfromtrash', verifyToken, dealController.getAllDealFromTrash)
router.delete('/deletefromtrash', verifyToken, dealController.deleteDealFromTrash)
router.post('/uplaoddoc', verifyToken, uploadDealLeadDoc, dealController.uploadDealDocuments)
router.get('/getuplaoddoc/:source_type/:source_id', verifyToken, dealController.getUploadedDocs)

// ====== workflow ====== //
router.post('/getAllStages/:type', verifyToken, dealController.getAllStagesDealLead)
router.post('/stages/add', verifyToken, dealController.addStagesForDealLead)
router.put('/stages/update/:stage_id', verifyToken, dealController.updateStage)
router.put('/workflow/updatestagerequirnment', verifyToken, dealController.updateStagesRequirement)

module.exports = router;
