var express = require('express');
var router = express.Router();
const settingController = require('../controller/settings')
const { verifyToken } = require('../model/auth')

// ====== password master settings ====== //
router.put('/password/edit', verifyToken, settingController.updatePasswordSetting)
router.get('/password/get', settingController.getPasswordSetting)

// ====== label master settings ====== //
router.post('/label/add', verifyToken, settingController.addLabel)
router.put('/label/edit/:labelId', verifyToken, settingController.updateLabel)
router.get('/label/getAll', verifyToken, settingController.getAllLabels)
router.delete('/label/delete', verifyToken, settingController.deleteLabel)
router.get('/label/getbyentity/:entity', verifyToken, settingController.getAllLabelsForEntity)

router.put('/edit/:id', verifyToken, settingController.updateAudit)
router.get('/getAll', verifyToken, settingController.getAllAudits)

router.get('/requireddocs/:source_type', verifyToken, settingController.getAllRequiredDocForDeal)
router.post('/adddocindocumentmaster', verifyToken, settingController.addDocumentInDocMaster)
router.put('/updatedocmaster', verifyToken, settingController.updateMasterDoc)

// ====== get logs ======= //
router.get('/getlogs/:logName', verifyToken, settingController.getLogs)


module.exports = router;
