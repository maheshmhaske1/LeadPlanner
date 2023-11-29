const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

cloudinary.config({
    cloud_name: 'cloud2cdn',
    api_key: '364648413743418',
    api_secret: 'mfTMtHGMsaJEy2vj1yxHWq1uCrs',
});

router.post('/upload', upload.array('images', 4), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const folder = '4';
    const uploadedImages = [];

    req.files.forEach((file) => {
        cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: folder, public_id: file.originalname },
            (error, result) => {
                if (error) {
                    console.error('Error uploading to Cloudinary:', error);
                    return res.status(500).send('Error uploading to Cloudinary.');
                }

                uploadedImages.push(result.secure_url);
                if (uploadedImages.length === req.files.length) {
                    res.json({ urls: uploadedImages });
                }
            }
        ).end(file.buffer);
    });
});

module.exports = router;
