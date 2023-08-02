var express = require('express');
var router = express.Router();
const settingController = require('../controller/settings')
const { verifyToken } = require('../model/auth')

// ====== password master settings ====== //
router.put('/password/edit/:passSettingId', verifyToken, settingController.updatePasswordSetting)
router.get('/password/get', verifyToken, settingController.getPasswordSetting)

module.exports = router;
