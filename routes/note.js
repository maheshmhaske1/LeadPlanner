var express = require('express');
var router = express.Router();
const noteController = require('../controller/note')
const { verifyToken } = require('../model/auth')

router.post('/add', verifyToken, noteController.createNote)
router.put('/edit/:noteId', verifyToken, noteController.updateNote)
router.get('/get/:noteId', verifyToken, noteController.get)
router.get('/getbysource/:source/:source_id', verifyToken, noteController.getAllBySource)
router.delete('/delete/:noteId', verifyToken, noteController.deleteNote)
router.post('/movetotrash', verifyToken, noteController.moveNoteToTrash)

module.exports = router;
