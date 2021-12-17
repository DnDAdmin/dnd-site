var express = require('express');
var router = express.Router();
var ops = require('../functions/databaseOps')
var eml = require('../functions/emailOps')
const formidable = require('formidable')
const {ObjectId} = require('mongodb');
const { authUser } = require('../functions/databaseOps');

var mainHeader = 'Mystery and Mischief | '

/* GET users listing. */
router.get('/', ops.authUser('admin'), async function(req, res, next) {
  var siteData = await ops.findItem(req.db.db('dndgroup'), 'data', {name: 'Site Data'})
  res.render('secure/admin', {
    title: mainHeader,
    user: req.session.user,
    data: siteData
  })
});

// Old. Uneeded
router.post('/commstat/:id', ops.authUser('admin'), async function(req, res, next) {
  await ops.updateItem(req.db.db('nrjsites'), 'data', {name: 'Site Data'}, {$set: {commStatus: req.params.id}})
  res.send('Commission Status Updated')
})

// Loads New User Invite Form
router.get('/invite', ops.authUser('admin'), async function(req, res, next) {
  res.render('secure/invite', {
    title: mainHeader,
    user: req.session.user
  })
});

// Send user invite email
router.post('/invite', ops.authUser('admin'), async function(req, res, next) {
  var emailURL = await eml.emailVar(req)

  var mailOptions = {
    from: 'Lore Seekers Admin',
    to: req.body.email,
    subject: 'Membership Invitation',
    html: ({path: emailURL + '/admin/invite/' + req.body.name})
  };

  await eml.sendMail(mailOptions)
})

// Loads new event form
router.get('/newevent', ops.authUser('admin'), function(req, res, next) {
  res.render('secure/newEvent', {
    title: mainHeader,
    event: {},
    user: req.session.user
  })
})

// Saves Event
router.post('/saveevent', ops.authUser('admin'), async function(req, res, next) {
  var form = new formidable.IncomingForm()
  form.parse(req, async function (err, fields, files) {

    fields.date = new Date(fields.date)

    await ops.addToDatabase(req.db.db('dndgroup'), 'events', [fields])
    console.log('Event added to database')

    req.session.message = 'Event added!'
    req.session.sub = true
    req.session.fields = fields

    res.redirect('/users/dashboard')
  })
})

router.get('/edit/event=:id', ops.authUser('admin'), async function(req, res, next) {
  var event = await ops.findItem(req.db.db('dndgroup'), 'events', {_id: ObjectId(req.params.id)})

  res.render('secure/editEvent', {
    title: mainHeader,
    event: event,
    user: req.session.user
  })

})

router.post('/edit/event=:id', ops.authUser('admin'), async function(req, res, next) {
  var form = new formidable.IncomingForm()
  form.parse(req, async function (err, fields, files) {

    fields.date = new Date(fields.date)

    await ops.updateItem(req.db.db('dndgroup'), 'events', {_id: ObjectId(req.params.id)}, {$set: fields})
    console.log('Event updated')

    req.session.message = 'Event updated!'
    req.session.sub = true
    req.session.fields = fields

    res.redirect('/users/dashboard')
  })
})


router.get('/itemlist', ops.authUser('admin'), async function(req, res, next) {
  items = await ops.findMany(req.db.db('dndgroup'), 'world-items', {})

  items.sort(function(a, b){
    if(a.type < b.type) { return -1; }
    if(a.type > b.type) { return 1; }
    return 0;
  });

  res.render('secure/itemList', {
    title: mainHeader,
    items: items,
    user: req.session.user
  })

})

router.get('/newitem', ops.authUser('admin'), async function(req, res, next) {
  var types = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'Item Types'})

  res.render('secure/newItem', {
    title: mainHeader,
    types: types.types,
    user: req.session.user
  })
})

router.post('/additem', ops.authUser('admin'), async function(req, res, next) {
  var form = new formidable.IncomingForm()
  form.parse(req, async function (err, fields, files) {
    // res.send(fields)
    await ops.addToDatabase(req.db.db('dndgroup'), 'world-items', [fields])
    console.log('Item Added')

    req.session.message = 'Item Added!'
    req.session.sub = true
    req.session.fields = fields

    res.redirect('/users/dashboard')
  })
})

router.get('/shoplist', ops.authUser('admin'), async function(req, res, next) {
  shops = await ops.findMany(req.db.db('dndgroup'), 'game_data', {shop: true})

  res.render('secure/shopList', {
    title: mainHeader,
    shops: shops,
    user: req.session.user
  })

})

router.get('/newshop', ops.authUser('admin'), async function(req, res, next) {
  var items = await ops.findMany(req.db.db('dndgroup'), 'world-items', {})

  items.sort(function(a, b){
    if(a.type < b.type) { return -1; }
    if(a.type > b.type) { return 1; }
    return 0;
  });

  res.render('secure/newShop', {
    title: mainHeader,
    items: items,
    user: req.session.user
  })
})


router.post('/addshop', ops.authUser('admin'), async function(req, res, next) {
  var form = new formidable.IncomingForm({multiples: true})
  form.parse(req, async function (err, fields, files) {
    fields.shop = true
    for(var i = 0; i < fields.items.length; i++) {
      var item = fields.items[i]
      fields.items[i] = new ObjectId(item)
    }
    await ops.addToDatabase(req.db.db('dndgroup'), 'game_data', [fields])
    console.log('Shop Added')

    req.session.message = 'Shop Added!'
    req.session.sub = true
    req.session.fields = fields

    res.redirect('/users/dashboard')
  })
})

module.exports = router;
