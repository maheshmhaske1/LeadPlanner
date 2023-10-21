var express = require('express');
var router = express.Router();
const settingController = require('../controller/settings')
const { verifyToken } = require('../model/auth')

// ====== password master settings ====== //
router.put('/password/edit/:org_id', verifyToken, settingController.updatePasswordSetting)
router.get('/password/get/:entity/:isOrgId', settingController.getPasswordSetting)

// ====== label master settings ====== //
router.post('/label/add', verifyToken, settingController.addLabel)
router.put('/label/edit/:labelId', verifyToken, settingController.updateLabel)
router.post('/label/getAll', verifyToken, settingController.getAllLabels)
router.delete('/label/delete', verifyToken, settingController.deleteLabel)
router.post('/label/getbyentity/:entity', verifyToken, settingController.getAllLabelsForEntity)

router.put('/edit/:id', verifyToken, settingController.updateAudit)
router.get('/getAll', verifyToken, settingController.getAllAudits)

router.post('/requireddocs/:source_type', verifyToken, settingController.getAllRequiredDocForDeal)
router.post('/adddocindocumentmaster', verifyToken, settingController.addDocumentInDocMaster)
router.put('/updatedocmaster', verifyToken, settingController.updateMasterDoc)

// ====== get logs ======= //
router.get('/getlogs/:logName', verifyToken, settingController.getLogs)


module.exports = router;
