var express = require('express');
var router = express.Router();
const thirdpartyapis = require('../controller/thirdpartyapis')
const { verifyToken } = require('../model/auth')

router.post('/docusign/envelope/send', thirdpartyapis.sendEnvolap)
router.get('/docusign/envelope/get', thirdpartyapis.getEnvolapDtails)
router.get('/docusign/refreshtoket/get', thirdpartyapis.getRefreshToken)

module.exports = router;
