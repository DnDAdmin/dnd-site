var express = require('express');
var router = express.Router();
var ops = require('../functions/databaseOps')
var eml = require('../functions/emailOps')
const formidable = require('formidable')
const {ObjectId} = require('mongodb');

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

module.exports = router;
