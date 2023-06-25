var express = require('express');
var router = express.Router();
const taskController = require('../controller/task')

router.post('/add', taskController.createTask)
router.put('/edit/:taskId', taskController.updateTask)
router.get('/get/:taskId', taskController.get)
router.get('/getBySource/:source_id', taskController.getAllBySource)

module.exports = router;
