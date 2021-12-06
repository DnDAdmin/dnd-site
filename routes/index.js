var express = require('express');
var router = express.Router();
var ops = require('../functions/databaseOps')

var mainHeader = 'Lore Seekers | '

/* GET home page. */
router.get('/', async function(req, res, next) {
  var siteData = await ops.findItem(req.db.db('nrjsites'), 'data', {name: 'Site Data'})
  res.render('index', {
    title: mainHeader,
    data: siteData,
    commStatus: 'Open',
    user: req.session.user
  });
});

module.exports = router;
