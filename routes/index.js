var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  // // res.render('index', { title: 'Express' });
  // const axios = require('axios');

  // const apiKey = 'XAEyAvpfkruAZLgil1zyBbTSHw9dGWBC';

  // async function find() {
  //   axios.get('https://api.os.uk/search/places/v1/find?maxresults=1&query=Ordnance%20Survey,%20Adanac%20Drive,%20SO16&key=' + apiKey)
  //     .then(function (response) {
  //       var response = JSON.stringify(response.data, null, 2);
  //       console.log(response);
  //     });
  // }
  // find();
});
router.get('/', function (req, res, next) {
  const axios = require('axios');

  const apiKey = 'XAEyAvpfkruAZLgil1zyBbTSHw9dGWBC';
  
  async function postcode() {
      axios.get('https://api.os.uk/search/places/v1/postcode?postcode=SO16&key=XAEyAvpfkruAZLgil1zyBbTSHw9dGWBC' + apiKey)
      .then(function(response) {
          var response = JSON.stringify(response.data, null, 2);
          console.log(response);
      });
  }
  postcode();
});

module.exports = router;
