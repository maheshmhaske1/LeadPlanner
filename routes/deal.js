var express = require('express');
var router = express.Router();
const dealController = require('../controller/deal')
const { verifyToken } = require('../model/auth')
const { uploadDealLeadDoc } = require('../model/upload')


router.post('/add', verifyToken, dealController.createDeal)
router.put('/edit/:dealId', verifyToken, dealController.updateDeal)
router.get('/get/:dealId', verifyToken, dealController.get)
router.get('/getall', verifyToken, dealController.getAll)
router.get('/getbyowner/:userId', verifyToken, dealController.getDealByOwner)

router.delete('/movetotrash', verifyToken, dealController.moveDealToTrash)
router.post('/restorefromtrash', verifyToken, dealController.restoreDealFromTrash)
router.get('/getallfromtrash', verifyToken, dealController.getAllDealFromTrash)
router.delete('/deletefromtrash', verifyToken, dealController.deleteDealFromTrash)
router.post('/uplaoddoc', verifyToken, uploadDealLeadDoc, dealController.uploadDealDocuments)
router.get('/getuplaoddoc/:dealId', verifyToken, dealController.getUploadedDocs)

module.exports = router;
