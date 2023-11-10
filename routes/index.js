var express = require('express');
var router = express.Router();
const axios = require('axios');


/* GET home page. */
router.get('/', async (req, res, next) => {
    const lat = 19.4552;
    const lng = 74.98875;
    const apiKey = 'AIzaSyAKKzPfrnhLHFG7xMO-snpRQ7ULl91iOQw&libraries=places'; // Replace with your actual API key
    const radius = 10000;
    const type = 'university';

    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;

    try {
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        console.error('Error in fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    // return res.json({
    //     status :"OK"
    // })
});

module.exports = router;
