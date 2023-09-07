var express = require('express');
var router = express.Router();
const LeaddealActivity = require('../controller/leaddealactivity')
const { verifyToken } = require('../model/auth')

router.post('/add', verifyToken, LeaddealActivity.createLeaddealActivity)
router.put('/edit/:activityId', verifyToken, LeaddealActivity.updateLeaddealActivity)
router.get('/getbysource/:activity_for/:source_id', verifyToken, LeaddealActivity.getLeaddealActivity)
router.delete('/delete/:activityId', verifyToken, LeaddealActivity.deleteLeaddealActivityFromTrash)

module.exports = router;
