var express = require('express');
var router = express.Router();
var ops = require('../functions/databaseOps')
var eml = require('../functions/emailOps')
const formidable = require('formidable')
const {ObjectId} = require('mongodb');
const { authUser, findMany, updateItem, findItem } = require('../functions/databaseOps');
const { Formidable } = require('formidable');
const hash = require('password-hash')

var mainHeader = 'Mystery and Mischief | '

// Loads New User Invite Form
router.get('/invite', ops.authUser('admin'), async function(req, res, next) {
  var access = await ops.findItem(req.db.db('dndgroup'), 'site_data', {name: 'User Permissions'})
  res.render('secure/invite', {
    title: mainHeader,
    access: access.access,
    user: req.session.user
  })
});

// Send user invite email
router.post('/invite', async function(req, res, next) {
  var form = new formidable.IncomingForm({multiples: true})
  form.parse(req, async function(err, fields, files) {
    var newId = new ObjectId()

    if(fields.access.length > 3) {
      fields.access = [fields.access]
    }

    fields._id = newId
    fields.invite = true

    if(fields.access.includes('admin')) {
      fields.adminRole = {
        name: 'Admin',
        class: 'siteAdmin'
      }
    }


    await ops.addToDatabase(req.db.db('dndgroup'), 'users', [fields])

    var emailURL = await eml.emailVar(req)
    var mailOptions = {
      from: 'Mystery and Mischief <admin@mysteryandmischief.com>',
      to: fields.email,
      subject: "You've been invited!",
      html: ({path: emailURL + '/emails/invite/user=' + newId})
    };
    await eml.sendMail(mailOptions)

    req.session.sub = true
    req.session.message = 'Invitation Sent!'

    res.redirect('/users/dashboard')

  })  
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
  var items = await ops.findMany(req.db.db('dndgroup'), 'world-items', {})
  var types = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'Item Types'})

  items.sort(function(a, b){
    if(parseInt(a.cost) < parseInt(b.cost)) { return -1; }
    if(parseInt(a.cost) > parseInt(b.cost)) { return 1; }
    return 0;
  });

  items.sort(function(a, b){
    if(a.type < b.type) { return -1; }
    if(a.type > b.type) { return 1; }
    return 0;
  });

  types.types.sort(function(a, b){
    if(a.class < b.class) { return -1; }
    if(a.class > b.class) { return 1; }
    return 0;
  });

  res.render('secure/itemList', {
    title: mainHeader,
    items: items,
    types: types.types,
    user: req.session.user
  })

})

router.get('/newitem', ops.authUser('admin'), async function(req, res, next) {
  var types = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'Item Types'})
  var shops = await ops.findMany(req.db.db('dndgroup'), 'game_data', {shop: true})

  res.render('secure/newItem', {
    title: mainHeader,
    types: types.types,
    shops: shops,
    user: req.session.user
  })
})

router.post('/additem', ops.authUser('admin'), async function(req, res, next) {
  var form = new formidable.IncomingForm({multiples: true})
  form.parse(req, async function (err, fields, files) {
    var itemId = new ObjectId()
    fields._id = itemId

    if(fields.shop) {
      if(Array.isArray(fields.shop)) {
        for(var i = 0; i < fields.shop.length; i++) {
          var shop = fields.shop[i]
          await ops.updateItem(req.db.db('dndgroup'), 'game_data', {_id: ObjectId(shop)}, {$push: {items: itemId}})
        }
      } else {
        await ops.updateItem(req.db.db('dndgroup'), 'game_data', {_id: ObjectId(fields.shop)}, {$push: {items: itemId}})
      }
    }
    
    await ops.addToDatabase(req.db.db('dndgroup'), 'world-items', [fields])
    console.log('Item Added')

    req.session.message = 'Item Added!'
    req.session.sub = true
    req.session.fields = fields

    res.redirect('/users/dashboard')

    // res.send(fields)

  })
})

router.get('/edit/item=:id', ops.authUser('admin'), async function(req, res, next) {
  var item = await ops.findItem(req.db.db('dndgroup'), 'world-items', {_id: ObjectId(req.params.id)})
  var types = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'Item Types'})
  var shops = await ops.findMany(req.db.db('dndgroup'), 'game_data', {shop: true})

  res.render('secure/editItem', {
    title: mainHeader,
    types: types.types,
    item: item,
    shops: shops,
    user: req.session.user
  })

})

router.post('/edit/item=:id', ops.authUser('admin'), async function(req, res, next) {
  var form = new formidable.IncomingForm({multiples: true})
  form.parse(req, async function (err, fields, files) {
    // res.send(fields)

    if(fields.shop) {
      if(Array.isArray(fields.shop)) {
        for(var i = 0; i < fields.shop.length; i++) {
          var shop = await ops.findItem(req.db.db('dndgroup'), 'game_data', {_id: ObjectId(fields.shop[i])})
          if(!shop.items.includes(req.params.id)) {
            await ops.updateItem(req.db.db('dndgroup'), 'game_data', {_id: ObjectId(shop._id)}, {$push: {items: req.params.id}})
          }
        }
      } else {
        var shop = await ops.findItem(req.db.db('dndgroup'), 'game_data', {_id: ObjectId(fields.shop)})
        if(!shop.items.includes(req.params.id)) {
          await ops.updateItem(req.db.db('dndgroup'), 'game_data', {_id: ObjectId(shop._id)}, {$push: {items: req.params.id}})
        }
      }
    }

    await ops.updateItem(req.db.db('dndgroup'), 'world-items', {_id: ObjectId(req.params.id)}, {$set: fields})
    console.log('Item Updated')

    req.session.message = 'Item Updated!'
    req.session.sub = true
    req.session.fields = fields

    res.redirect('/users/dashboard')
  })
})

router.post('/delete/item=:id', ops.authUser('admin'), async function(req, res, next) {
  
  await ops.deleteItem(req.db.db('dndgroup'), 'world-items', {_id: ObjectId(req.params.id)})

  var shops = await findMany(req.db.db('dndgroup'), 'game_data', {items: req.params.id})

  for(var i = 0; i < shops.length; i++) {
    var shop = shops[i]
    shop.items.splice(shop.items.indexOf(req.params.id), 1)
    await ops.updateItem(req.db.db('dndgroup'), 'game_data', {_id: ObjectId(shop._id)}, {$set: shop})
    console.log('Item removed from ' + shop.name)
  }

  console.log('Item Deleted')

  req.session.message = 'Item Deleted!'
  req.session.sub = true

  res.redirect('/users/dashboard')
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

    await ops.addToDatabase(req.db.db('dndgroup'), 'game_data', [fields])
    console.log('Shop Added')

    req.session.message = 'Shop Added!'
    req.session.sub = true
    req.session.fields = fields

    res.redirect('/users/dashboard')
  })
})

router.get('/edit/shop=:id', ops.authUser('admin'), async function(req, res, next) {
  var shop = await ops.findItem(req.db.db('dndgroup'), 'game_data', {_id: ObjectId(req.params.id)})
  var items = await ops.findMany(req.db.db('dndgroup'), 'world-items', {})

  items.sort(function(a, b){
    if(parseInt(a.cost) < parseInt(b.cost)) { return -1; }
    if(parseInt(a.cost) > parseInt(b.cost)) { return 1; }
    return 0;
  });

  items.sort(function(a, b){
    if(a.type < b.type) { return -1; }
    if(a.type > b.type) { return 1; }
    return 0;
  });

  res.render('secure/editShop', {
    title: mainHeader,
    shop: shop,
    items: items,
    user: req.session.user
  })
})

router.post('/edit/shop=:id', ops.authUser('admin'), async function(req, res, next) {
  var form = new formidable.IncomingForm({multiples: true})
  form.parse(req, async function (err, fields, files) {

    await ops.updateItem(req.db.db('dndgroup'), 'game_data', {_id: ObjectId(req.params.id)}, {$set: fields})
    console.log('Shop Updated')

    req.session.message = 'Shop Updated!'
    req.session.sub = true
    req.session.fields = fields

    res.redirect('/users/dashboard')
  })
})

router.post('/delete/shop=:id', ops.authUser('admin'), async function(req, res, next) {
  
  await ops.deleteItem(req.db.db('dndgroup'), 'game_data', {_id: ObjectId(req.params.id)})

  var shops = await findMany(req.db.db('dndgroup'), 'game_data', {items: req.params.id})

  console.log('Shop Deleted')

  req.session.message = 'Shop Deleted!'
  req.session.sub = true

  res.redirect('/users/dashboard')
})


router.get('/siteUpdate', ops.authUser('super'), function(req, res, next) {
  res.render('secure/addSiteUpdate', {
    title: mainHeader,
    user: req.session.user
  })
})

router.get('/updatedrafts', authUser('super'), async function(req, res, next) {
  var drafts = await ops.findMany(req.db.db('dndgroup'), 'site_updates', {draft: true})
  res.render('secure/updateDrafts', {
    title: mainHeader,
    drafts: drafts,
    user: req.session.user
  })
})

router.get('/edit/draft=:id', ops.authUser('super'), async function(req, res, next) {
  var draft = await ops.findItem(req.db.db('dndgroup'), 'site_updates', {_id: ObjectId(req.params.id)})
  res.render('secure/editUpdateDraft', {
    title: mainHeader,
    draft: draft,
    user: req.session.user
  })
})

router.post('/edit/draft=:id', ops.authUser('super'), async function(req, res, next) {
  var form = new formidable.IncomingForm()
  form.parse(req, async function (err, fields, files) {
    if(fields.draft) {
      fields.draft = true
    } else {
      fields.draft = false
    }
    fields.date = new Date(Date.now())
    
    await ops.updateItem(req.db.db('dndgroup'), 'site_updates', {_id: ObjectId(req.params.id)}, {$set: fields})
    
    if(fields.draft) {
      res.redirect('/admin/updatedrafts')
    } else {
      res.redirect('/siteupdates')
    }
  })
})

router.post('/siteupdate', ops.authUser('super'), async function(req, res, next) {
  var form = new formidable.IncomingForm()
  form.parse(req, async function (err, fields, files) {
    if(fields.draft) {
      fields.draft = true
    } else {
      fields.draft = false
    }
    fields.date = new Date(Date.now())
    
    await ops.addToDatabase(req.db.db('dndgroup'), 'site_updates', [fields])
    
    if(fields.draft) {
      res.redirect('/admin/updatedrafts')
    } else {
      res.redirect('/siteupdates')
    }
  })
})

router.post('/delete/update=:id', ops.authUser('super'), async function(req, res, next) {
  await ops.deleteItem(req.db.db('dndgroup'), 'site_updates', {_id: ObjectId(req.params.id)})
  console.log('Update Deleted')
  res.redirect('/siteupdates')
})


router.get('/site/errors', ops.authUser('super'), async function(req, res, next) {
  var errors = await ops.findMany(req.db.db('dndgroup'), 'site_errors', {})

  for(var i = 0; i < errors.length; i++) {
    var err = errors[i]
    if(!err.viewed) {
      await updateItem(req.db.db('dndgroup'), 'site_errors', {_id: ObjectId(err._id)}, {$set: err})
    }
  }

  errors.sort(function(a, b){
    if(a.date > b.date) { return -1; }
    if(a.date < b.date) { return 1; }
    return 0;
  });

  res.render('secure/siteErrors', {
    title: mainHeader,
    errors: errors,
    user: req.session.user
  })
})


router.get('/newgamesess', ops.authUser('admin'), async function(req, res, next) {
  var quests = await ops.findMany(req.db.db('dndgroup'), 'game_quests', {archived: false})
  var users = await ops.findMany(req.db.db('dndgroup'), 'users', {invite: null})
  res.render('secure/newGameSession', {
    title: mainHeader,
    quests: quests,
    users: users,
    user: req.session.user
  })
})

router.post('/newgamesess', ops.authUser('admin'), async function(req, res, next) {
  var form = new formidable.IncomingForm({multiples: true})
  form.parse(req, async function (err, fields, files) {
    var currUser = req.session.user
    var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(currUser.id)})
    var thisUser = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(userSess.user)})
    
    var playerArray
    var session = {
      players: {
        [thisUser._id]: {
          userName: thisUser.userName
        }
      },
      active: true
    }

    if(!Array.isArray(fields.participants)) {
      playerArray = [ fields.participants ]
    } else {
      playerArray = fields.participants
    }

    for(var i = 0; i < playerArray.length; i++) {
      var player = playerArray[i]
      var playerInfo = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(player)})
      session.players[player] = {
        userName: playerInfo.userName
      }
    }

    if(fields.isNewQuest) {
      console.log('New Quest')
      var newID = new ObjectId()
      var newQuest = {
        _id: newID,
        name: fields.newQuest,
        archived: false
      }
      await ops.addToDatabase(req.db.db('dndgroup'), 'game_quests', [newQuest])
      session.quest = newID
    } else {
      session.quest = fields.quest
    }

    await ops.addToDatabase(req.db.db('dndgroup'), 'game_sessions', [session])

    res.send(session)
  })
})

module.exports = router;
