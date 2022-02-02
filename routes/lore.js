var express = require('express');
var router = express.Router();
var ops = require('../functions/databaseOps')
const {ObjectId} = require('mongodb');

var mainHeader = 'Mystery and Mischief | '

/* Opens the map */
router.get('/map', ops.authUser(), async function(req, res, next) {
  console.log('Loading Map...')
  let dots = await ops.findMany(req.db.db('dndgroup'), 'lore_map_dots', {})
  res.render('lore/map', {
    head: mainHeader + "Map",
    info: dots,
    noTrk: true,
    user: req.session.user
  })
})

module.exports = router;
