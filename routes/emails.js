var express = require('express');
var router = express.Router();
var ops = require('../functions/databaseOps')
const {ObjectId} = require('mongodb');
var eml = require('../functions/emailOps')

var mainHeader = 'Mystery and Mischief | '

router.get('/invite/user=:id', ops.authUser('admin'), function(req, res, next) {
  var user = ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})
  res.render('emails/invite', {
    title: mainHeader,
    user: user
  })
})


module.exports = router;
