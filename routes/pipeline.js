var express = require('express');
var router = express.Router();
const pipelineController = require('../controller/pipeline')

router.post('/add', pipelineController.createPipeline)
router.put('/edit/:pipelineId', pipelineController.updatePipeline)
router.get('/get/:pipelineId', pipelineController.get)
router.get('/getall', pipelineController.getAll)

module.exports = router;
