var express = require('express');
var router = express.Router();
const contactController = require('../controller/contact')
const { verifyToken } = require('../model/auth')

router.post('/company/add', verifyToken, contactController.createContact)
router.post('/company/import', verifyToken, contactController.importContact)
router.put('/company/edit/:companyId', verifyToken, contactController.update)
router.post('/company/get', verifyToken, contactController.getAllCompanies)
router.delete('/company/delete/:companyId', verifyToken, contactController.delete)

// PERSON 
router.post('/person/add', verifyToken, contactController.createContactPerson)
router.put('/person/edit/:contactPersonId', verifyToken, contactController.updateContactPerson)
router.post('/person/get', verifyToken, contactController.getAllContactPersons)
router.delete('/person/delete/:contactPersonId', verifyToken, contactController.deleteContactPerson)
router.post('/person/import', verifyToken, contactController.importPerson)

// recycle bin
router.post('/movetotrash', verifyToken, contactController.moveContactToTrash)
router.post('/removefromtrash', verifyToken, contactController.removeContactFromTrash)
router.post('/getfromtrash', verifyToken, contactController.getContactFromTrash)
router.delete('/deletefromtrash', verifyToken, contactController.deleteContactFromTrash)
router.post('/getById', verifyToken, contactController.getContactById)



module.exports = router;

