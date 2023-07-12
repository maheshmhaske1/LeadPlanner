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
  if (!req.session.userId) {
    return res.json({
      message: 'please login'
    })
  }
  else
    return res.json({
      status: 200,
      session: req.session.userId
    })

});

module.exports = router;
