var express = require('express');
var router = express.Router();
var ops = require('../functions/databaseOps')
var eml = require('../functions/emailOps')

var mainHeader = 'Lore Seekers | '

router.get('/invite/:name', ops.authUser('admin'), function(req, res, next) {
  res.render('emails/invite', {
    name: req.params.name
  })
})


module.exports = router;
