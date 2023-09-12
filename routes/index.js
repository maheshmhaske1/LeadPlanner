var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
  // const SibApiV3Sdk = require('sib-api-v3-sdk');
  // let defaultClient = SibApiV3Sdk.ApiClient.instance;

  // let apiKey = defaultClient.authentications['api-key'];
  // apiKey.apiKey = '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';

  // let apiInstance = new SibApiV3Sdk.EmailCampaignsApi();

  // let opts = {
  //   'type': "classic",
  //   'status': "sent",
  //   'startDate': new Date("2021-01-01T00:00:00+00:00"),
  //   'endDate': new Date("2021-01-01T00:00:00+00:00"),
  //   'limit': 500,
  //   'offset': 0
  // };
  // apiInstance.getEmailCampaigns(opts).then(function (data) {
  //   console.log('API called successfully. Returned data: ' + JSON.stringify(data));
  // }, function (error) {
  //   console.error(error);
  // });
});

module.exports = router;
