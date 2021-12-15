var express = require('express');
var router = express.Router();
var ops = require('../functions/databaseOps')
const {ObjectId} = require('mongodb');

var mainHeader = 'Mystery and Mischief | '

/* GET home page. */
router.get('/', async function(req, res, next) {
  var events = await ops.findMany(req.db.db('dndgroup'), 'events', {})

  events.sort(function(a, b){
    if(a.date < b.date) { return -1; }
    if(a.date > b.date) { return 1; }
    return 0;
  });

  res.render('index', {
    title: mainHeader,
    event: events[0],
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

module.exports = router;
