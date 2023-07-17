var express = require('express');
var router = express.Router();
const taskController = require('../controller/task')
const { verifyToken } = require('../model/auth')

router.post('/add', verifyToken, taskController.createTask)
router.put('/edit/:taskId', verifyToken, taskController.updateTask)
router.get('/get/:taskId', verifyToken, taskController.get)
router.get('/getbysource/:source/:source_id', verifyToken, taskController.getAllBySource)

module.exports = router;
