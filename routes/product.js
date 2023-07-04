var express = require('express');
var router = express.Router();
const productController = require('../controller/product')

router.post('/add', productController.createProduct)
router.put('/edit/:productId', productController.updateProduct)
router.get('/get/:productId', productController.get)
router.get('/getall', productController.getAll)

module.exports = router;
