var express = require('express');
var router = express.Router();
const dealController = require('../controller/deal')
const { verifyToken } = require('../model/auth')


router.post('/add',verifyToken, dealController.createDeal)
router.put('/edit/:dealId',verifyToken, dealController.updateDeal)
router.get('/get/:dealId',verifyToken, dealController.get)
router.get('/getall', verifyToken,dealController.getAll)

module.exports = router;
