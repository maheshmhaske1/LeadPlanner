var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/',function (req, res, next) {
  res.render('index', { title: 'Express' });
});

<<<<<<< HEAD
=======
// res.render('index', { title: 'Express' });
router.get('/api/test', function (req, res, next) {
  console.log("req.session.userId in if ==>",req.session.userId)
  if (!req.session.userId) {
    console.log("req.session.userId in if ==>",req.session.userId)
    return res.json({
      message: 'please login'
    })
  }
  else
    return res.json({
      status: 200,
      session: req.session.userId
    })
>>>>>>> 1b322f9fdfcfb8c251b28856d15441e693e10b6a


module.exports = router;
