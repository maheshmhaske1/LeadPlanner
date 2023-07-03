var express = require('express');
var router = express.Router();
const SQL = require('../model/sqlhandler')
const multer = require('multer');
const csv = require('csv-parser');
const db = require('../model/db')
const fs = require('fs')

const leadController = require('../controller/lead')
const upload = multer({ dest: '/public/leadcsv/' });

router.post('/add', leadController.createLead)
router.put('/edit/:leadId', leadController.updateLead)
router.get('/get/:leadId', leadController.get)
router.get('/getAll', leadController.getAll)
router.post('/importCsv', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }


    if (!req.body.userId) {
        return res.json({
            status: false,
            message: "please provide userId"
        })
    }

    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    if (fileExtension !== "csv") {
        return res.json({
            status: false,
            message: `please provide .csv file .${fileExtension} format not allowed`
        })
    }

    const results = [];
    let resultLength = 0;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            results.push(data);
        })
        .on('end', () => {
            fs.unlinkSync(req.file.path);
            if (results.length == 0) {
                return res.json({
                    status: false,
                    message: `${req.file.originalname} is Empty`
                })
            }
            let failCount = 0
            let successCount = 0

            results.map(async (result, i) => {
                if (!result.first_name || !result.last_name || !result.company_name || !result.registration_no ||
                    !result.employees || !result.email) {
                    return res.json({
                        status: false,
                        message: `first_name, last_name, company_name, gender, registration_no, employees, email these are required values please check row number ${i + 1}.`
                    })
                }
            })
            results.map(async (result, i) => {
                resultLength = i + 1
                await SQL.insert('lead', result, (error, result) => {
                    if (error) {
                        failCount += 1
                        return res.json({
                            status: false,
                            error: error
                        })
                    }
                })
                successCount += 1
                if (resultLength == i + 1) {
                    let batch = {
                        file_name: req.file.originalname,
                        user_id: req.body.userId,
                        total_count: i,
                        success_count: successCount,
                        fail_count: failCount
                    }
                    await SQL.insert('batch', batch, (error, result) => {

                    })
                    return res.json({
                        status: true,
                        message: "leads data imported"
                    })
                }
            })
        });

})


module.exports = router;
