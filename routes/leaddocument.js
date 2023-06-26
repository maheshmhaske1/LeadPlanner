var express = require('express');
var router = express.Router();
const docController = require('../controller/leaddocument')
const { uploadImg,uploadBlogImg } = require('../model/upload')

router.put('/edit/:docId', uploadImg('leadDoc'), docController.updateDoc)
router.get('/get/:docId', docController.get)
router.get('/getBySource/:source_id', docController.getAllBySource)
router.post('/add',uploadImg('leadDoc'),docController.createDoc)

module.exports = router;
