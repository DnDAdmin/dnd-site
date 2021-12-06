var express = require('express');
var router = express.Router();
var ops = require('../functions/databaseOps')
var eml = require('../functions/emailOps')

var mainHeader = 'Lore Seekers | '

/* GET users listing. */
router.get('/', ops.authUser('admin'), async function(req, res, next) {
  var siteData = await ops.findItem(req.db.db('dndgroup'), 'data', {name: 'Site Data'})
  res.render('secure/admin', {
    title: mainHeader,
    user: req.session.user,
    data: siteData
  })
});

router.post('/commstat/:id', ops.authUser('admin'), async function(req, res, next) {
  await ops.updateItem(req.db.db('nrjsites'), 'data', {name: 'Site Data'}, {$set: {commStatus: req.params.id}})
  res.send('Commission Status Updated')
})

router.get('/invite', ops.authUser('admin'), async function(req, res, next) {
  res.render('secure/invite', {
    title: mainHeader,
    user: req.session.user
  })
});

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


module.exports = router;
