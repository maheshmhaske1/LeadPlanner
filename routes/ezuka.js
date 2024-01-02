var express = require('express');
var router = express.Router();
const ezukaController = require('../controller/ezuka')


router.post('/contact/create', ezukaController.createContact)

module.exports = router;
