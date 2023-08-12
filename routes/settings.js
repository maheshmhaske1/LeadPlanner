var express = require('express');
var router = express.Router();
const settingController = require('../controller/settings')
const { verifyToken } = require('../model/auth')

// ====== password master settings ====== //
router.put('/password/edit', verifyToken, settingController.updatePasswordSetting)
router.get('/password/get', verifyToken, settingController.getPasswordSetting)

// ====== label master settings ====== //
router.post('/label/add', verifyToken, settingController.addLabel)
router.put('/label/edit/:labelId', verifyToken, settingController.updateLabel)
router.get('/label/getAll', verifyToken, settingController.getAllLabels)
router.delete('/label/delete', verifyToken, settingController.deleteLabel)
router.get('/label/getbyentity/:entity', verifyToken, settingController.getAllLabelsForEntity)

router.put('/audit/edit/:id', verifyToken, settingController.updateAudit)
router.get('/audit/getAll', verifyToken, settingController.getAllAudits)

module.exports = router;
