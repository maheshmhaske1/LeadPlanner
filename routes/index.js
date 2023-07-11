var express = require('express');
var router = express.Router();
var session = require('../model/session')

const checkSession = session.checkSession

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// res.render('index', { title: 'Express' });
router.get('/api/test', function (req, res, next) {
  console.log(req.session)
  // res.json({
  //   status: true,
  //   message: "OK"
  // })
});

module.exports = router;
