var express = require('express');
var router = express.Router();
const noteController = require('../controller/note')
const { verifyToken } = require('../model/auth')

router.post('/add', verifyToken, noteController.createNote)
router.put('/edit/:noteId', verifyToken, noteController.updateNote)
router.get('/get/:noteId', verifyToken, noteController.get)
router.get('/getbysource/:source/:source_id', verifyToken, noteController.getAllBySource)
router.post('/movetotrash', verifyToken, noteController.moveNoteToTrash)
router.post('/restorefromtrash', verifyToken, noteController.moveFromTrash)
router.post('/deletefromtrash', verifyToken, noteController.deleteFromTrash)
router.get('/getnotesfromtrash', verifyToken, noteController.getAllTrashedNotes)

module.exports = router;
