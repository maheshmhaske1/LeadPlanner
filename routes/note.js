var express = require('express');
var router = express.Router();
const noteController = require('../controller/note')

router.post('/add', noteController.createNote)
router.put('/edit/:noteId', noteController.updateNote)
router.get('/get/:noteId', noteController.get)
router.get('/getbysource/:source_id', noteController.getAllBySource)

module.exports = router;
