var express = require('express');
var router = express.Router();
var ops = require('../functions/databaseOps')
const {ObjectId} = require('mongodb');

var mainHeader = 'Mystery and Mischief | '

/* GET home page. */
router.get('/', async function(req, res, next) {
  console.log(req.api)
  var events = await ops.findMany(req.db.db('dndgroup'), 'events', {})

  events.sort(function(a, b){
    if(a.date > b.date) { return -1; }
    if(a.date < b.date) { return 1; }
    return 0;
  });

  const event = new Date(events[0].date) > new Date(Date.now()) ? events[0] : null

  res.render('index', {
    title: mainHeader,
    event: event,
    user: req.session.user
  });
});

router.get('/event/:id', async function(req, res, next) {
  var event = await ops.findItem(req.db.db('dndgroup'), 'events', {_id: ObjectId(req.params.id)})

  res.render('event', {
    title: mainHeader,
    event: event,
    user: req.session.user
  })

})

router.get('/siteupdates', async function(req, res, next) {
  var updates = await ops.findMany(req.db.db('dndgroup'), 'site_updates', {draft: false})
  updates.sort(function(a, b){
    if(a.date > b.date) { return -1; }
    if(a.date < b.date) { return 1; }
    return 0;
  });

  res.render('siteUpdates', {
    title: mainHeader,
    updates: updates,
    user: req.session.user
  })

})

router.get('/error', function(req, res, next) {
  var error = req.session.error
  req.session.error = null

  res.render('error', {
    error: error
  })

})

module.exports = router;
