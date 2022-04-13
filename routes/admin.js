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


router.get('/homebrew', ops.authUser('admin'), async function(req, res, next) {
  res.render('secure/homebrew', {
    title: mainHeader,
    user: req.session.user
  })
})

router.get('/newhomebrew', ops.authUser('admin'), async function(req, res, next) {
  res.render('secure/newHomebrew', {
    title: mainHeader,
    user: req.session.user
  })
})

router.post('/newhomebrew', ops.authUser('admin'), async function(req, res, next) {
  var form = new formidable.IncomingForm({multiples: true})
  form.parse(req, async function (err, fields, files) {
    let items = {}
    let errors = []

    let required = []
    fields.required ? required = fields.required.split(',') : null

    console.log(required)

    for(let key in fields) {
      let val = fields[key]

      val.includes(',') ? val = val.split(',') : null

      if(key.includes('/')) {
        key = key.split('/')
        console.log(`${key[0]} > ${key[1]}: ${val}`)
        items[key[0]] ? items[key[0]][key[1]] = val : items[key[0]] = {[key[1]]: val}

        required.includes(key[1]) && val.length < 1 ? errors.push({field: `${key[1]}/${key[1]}`, message: `${key[1]} is required.`}) : null

      } else {
        items[key] = val
        console.log(key)
        required.includes(key.toString()) && val.length < 1 ? errors.push({field: key, message: `${key} is required.`}) : null
      }
      
    }

    errors.length > 0 ? res.json({ok: false, resp: errors}) : res.json({ok: true})


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
  const items = await req.useAPI('/api/equipment')
  console.log(items)

  res.render('secure/newShop', {
    title: mainHeader,
    items: items.results,
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
  const items = await req.useAPI('/api/equipment')

  res.render('secure/editShop', {
    title: mainHeader,
    shop: shop,
    items: items.results,
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
    if(err.viewed) {
      var dateNow = new Date()
      var pastDate = dateNow.getDate() - 7
      if(err.date < pastDate) {
        console.log('Date is past')
      }
      // await updateItem(req.db.db('dndgroup'), 'site_errors', {_id: ObjectId(err._id)}, {$set: err})
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

router.post('/setseen/err=:id', ops.authUser('super'), async function(req, res, next) {
  var form = new formidable.IncomingForm()
  form.parse(req, async function (err, fields, files) {
    await ops.updateItem(req.db.db('dndgroup'), 'site_errors', {_id: ObjectId(req.params.id)}, {$set: fields})
    res.send('success')
  })
})

router.post('/deleteseen', ops.authUser('super'), async function(req, res, next) {
  var errs = await ops.findMany(req.db.db('dndgroup'), 'site_errors', {viewed: 'true'})
  for(var i = 0; i < errs.length; i++) {
    var err = errs[i]
    await ops.deleteItem(req.db.db('dndgroup'), 'site_errors', {_id: ObjectId(err._id)})
  }
  res.redirect('/admin/site/errors')
})


router.get('/newgamesess', ops.authUser('admin'), async function(req, res, next) {
  var currentSess = await ops.findItem(req.db.db('dndgroup'), 'game_sessions', {active: true})
  if(currentSess) {
    req.session.sub = true
    req.session.error = 'Cannot start new session while another is active.'
    res.redirect('/users/dashboard')
  } else {
    var quests = await ops.findMany(req.db.db('dndgroup'), 'game_quests', {archived: false})
    var users = await ops.findMany(req.db.db('dndgroup'), 'users', {invite: null})
    res.render('secure/newGameSession', {
      title: mainHeader,
      quests: quests,
      users, users,
      user: req.session.user
    })
  }
  
})

router.post('/newgamesess', ops.authUser('admin'), async function(req, res, next) {
  var currUser = req.session.user
  var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(currUser.id)})
  var currentSess = await ops.findItem(req.db.db('dndgroup'), 'game_sessions', {active: true})
  if(currentSess) {
    res.redirect('/users/gamesession/user=' + userSess.user)
  } else {
    var form = new formidable.IncomingForm({multiples: true})
    form.parse(req, async function (err, fields, files) {
      var thisUser = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(userSess.user)})

      var session = {
        active: true
      }

      if(fields.isNewQuest) {
        console.log('New Quest')
        var newID = new ObjectId()

        var newQuest = {
          _id: newID,
          name: fields.newQuest,
          players: {
            [thisUser._id]: {
              userName: thisUser.userName,
              role: 'DM'
            }
          },
          dm: fields.dm,
          archived: false
        }
        
        await ops.addToDatabase(req.db.db('dndgroup'), 'game_quests', [newQuest])
        session.quest = newID
      } else {
        session.quest = fields.quest
      }

      await ops.addToDatabase(req.db.db('dndgroup'), 'game_sessions', [session])

      res.redirect('/users/gamesession/user=' + thisUser._id)
    })
  }
  
})

router.post('/endgamesess', ops.authUser('admin'), async function(req, res, next) {
  var gameSession = await ops.findItem(req.db.db('dndgroup'), 'game_sessions', {active: true})
  await updateItem(req.db.db('dndgroup'), 'game_sessions', {_id: ObjectId(gameSession._id)}, {$set: {active: false}})
  req.session.sub = true
  req.session.message = 'Session ended'
  res.redirect('/users/dashboard')
})

router.post('/updatequestplayers/quest=:qst', ops.authUser('admin'), async function(req, res, next) {
  var form = new formidable.IncomingForm({multiples: true})
  form.parse(req, async function (err, fields, files) {
    var quest = await ops.findItem(req.db.db('dndgroup'), 'game_quests', {_id: ObjectId(req.params.qst)})
    var players = []
    if(Array.isArray(fields.players)) {
      players = fields.players
    } else {
      players = [fields.players]
    }

    for(var i = 0; i < Object.keys(quest.players).length; i++) {
      var player = Object.keys(quest.players)[i]
      if(!players.includes(player)) {
        if(player != quest.dm) {
          delete quest.players[player]
        }
      }
    }
    
    if(fields.players) {
      for(var i = 0; i < players.length; i++) {
        var player = players[i]
        var playerInfo = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(player)})
        if(!quest.players[player]) {
          quest.players[player] = {
            userName: playerInfo.userName,
            role: 'player'
          }
        }
      }
    }
    

    await ops.updateItem(req.db.db('dndgroup'), 'game_quests', {_id: ObjectId(req.params.qst)}, {$set: quest})

    var currUser = req.session.user
    var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(currUser.id)})

    res.redirect('/users/gamesession/user=' + userSess.user)

  })

})

module.exports = router;
