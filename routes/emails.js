var express = require('express');
var router = express.Router();
var ops = require('../functions/databaseOps')
const {ObjectId} = require('mongodb');


var mainHeader = 'Mystery and Mischief | '

router.get('/invite/user=:id', async function(req, res, next) {
  var user = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})
  res.render('emails/invite', {
    title: mainHeader,
    user: user
  })
})

router.get('/welcome/user=:id', async function(req, res, next) {
  var user = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})
  res.render('emails/welcome', {
    title: mainHeader,
    user: user
  })
})


module.exports = router;
