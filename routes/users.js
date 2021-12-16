var express = require('express');
var router = express.Router();
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const hash = require('password-hash')
var ops = require('../functions/databaseOps')
const {ObjectId} = require('mongodb');
const { authUser, findItem, addToDatabase } = require('../functions/databaseOps');

var mainHeader = 'Mystery and Mischief | '

// Login Page
router.get('/login', async function(req, res, next) {
  if(req.session.user) {
    var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(req.session.user.id)})
    if(userSess) {
      res.redirect('/users/dashboard/user=' + userSess.user)
    } else {
      req.session.user = null
      loadPage()
    }
  } else {
    loadPage()
  }

  function loadPage() {
    if(req.session.sub) {
      console.log('form has been submitted.')
      req.session.sub = null

      var err
      err = req.session.errors
      req.session.errors = null

      var msg
      msg = req.session.message
      req.session.message = null

      var fields = {}
      if(req.session.fields) {
        fields = req.session.fields
        req.session.fields = null
      }

      if(msg) {
        console.log(msg)

        res.render('secure/login', {
          title: mainHeader,
          fields: fields,
          message: msg
        })
      } else {
        console.log(err)

        res.render('secure/login', {
          title: mainHeader,
          fields: fields,
          errors: err
        })
      }

      

      

    } else {
      res.render('secure/login',{
        title: mainHeader,
        fields: {}
      })
    }
  }
  
});

// Logs User in
router.post('/login', async function(req, res, next) {
  var form = new formidable.IncomingForm()
  form.parse(req, async function (err, fields, files) {
      
      var user = await ops.findItem(req.db.db('dndgroup'), 'users', {$or: [{userName: fields.name}, {email: fields.name}]})

      if(user) {
        if(hash.verify(fields.pass, user.password)) {
        // if(fields.pass == user.password) {

          var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {user: ObjectId(user._id)})

          var key = Math.floor(100000 + Math.random() * 900000).toString()
          var hashedKey = hash.generate(key)
          var date = new Date(Date.now())

          var tempUser = {
            key: hashedKey,
            date: date
          }

          if(userSess) {
            userSess.date = date
            if(Object.keys(userSess.sessions).length < 3) {
              console.log('Adding new session.')

              var index = [0, 1, 2]
              for(var i = 0; i < index.length; i++) {
                var number = index[i]
                console.log(number)
                if(!userSess.sessions[number]) {
                  index = i
                  console.log('Index is ' + index)
                  break
                }
              }

              userSess.sessions[index] = tempUser

              req.session.user = {
                userName: user.userName,
                id: userSess._id,
                key: key,
                index: index,
                profileImage: user.profileImage,
                permissions: user.access
              }
            } else {
              var earliest = 0
              for(var i = 0; i < Object.keys(userSess.sessions).length; i++) {
                var newer = userSess.sessions[Object.keys(userSess.sessions)[earliest]]
                var item = userSess.sessions[Object.keys(userSess.sessions)[i]]
                if(item.date < newer.date) {
                  earliest = i
                }
              }

              console.log('Replacing session ' + earliest)

              userSess.sessions[Object.keys(userSess.sessions)[earliest]] = tempUser

              req.session.user = {
                userName: user.userName,
                id: userSess._id,
                key: key,
                index: earliest,
                profileImage: user.profileImage,
                permissions: user.access
              }


              // for(var i = 0; i < Object.keys(userSess.sessions).length; i++) {
              //   var ses = info[Object.keys(userSess.sessions)[i]]

              //   if(item != org) {
              //       changed = true
              //   }

              // }
              // userSess.sessions[0] = tempUser

              
            }

            var newSess = await ops.updateItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(userSess._id)}, {$set: userSess})

            if(newSess) {
              console.log('User session made.')
              // res.send(req.session.user)
              res.redirect('/users/dashboard/user=' + user._id)
            } else {
              console.log('error adding session to db')
              error('Error adding session to database.')
            }


            
          } else {
            console.log('Creating new session.')
            var tempId = new ObjectId()
            var session = {
              name: user.userName,
              _id: tempId,
              user: new ObjectId(user._id),
              access: user.access,
              sessions: {0: tempUser},
              date: date
            }

            req.session.user = {
              userName: user.userName,
              id: tempId,
              key: key,
              index: 0,
              profileImage: user.profileImage,
              permissions: user.access
            }

            var dbUserSession = await ops.addToDatabase(req.db.db('dndgroup'), 'userSessions', [session])

            if(dbUserSession) {
              console.log('User session made.')
              // res.send(req.session.user)
              res.redirect('/users/dashboard/user=' + user._id)
            } else {
              console.log('error making db session.')
              error('Error trying to find user in database.')
            }

            
          }

          
        } else {
          console.log('error matching passwords.')
          error('Invalid password.')
          res.redirect('/users/login')
        }
      } else {
        console.log('error finding user')
        error('Could not find user in database.')
        res.redirect('/users/login')
      }
    function error(err) {
      req.session.errors = err
      req.session.sub = true
      req.session.fields = fields
      res.redirect('/users/login')
    }
  })
})

// Logs User out
router.get('/logout', async function(req, res, next) {
  var user = req.session.user
  var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(user.id)})

  if(Object.keys(userSess.sessions).length < 3) {
    await ops.deleteItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(userSess._id)})
    console.log('Main user session deleted.')
    req.session.user = null
    req.session.message = 'You have been logged out'
    req.session.sub = true
    res.redirect('/users/login')
  } else {
    delete userSess.sessions[user.index]
    var out = await ops.updateItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(user.id)}, {$set: userSess})
    if(out) {
      req.session.user = null
      req.session.message = 'You have been logged out'
      req.session.sub = true
      console.log('Removed current user session.')
      res.redirect('/users/login')
    } else {
      res.send('Error removing session from database.')
    }
  }
})

// ------ Pages ------

// Dashboard
router.get('/dashboard/user=:id', authUser(), async function(req,res,next) {
  var thisUser = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})

  var currUser = req.session.user
  var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(currUser.id)})
  var user = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(userSess.user)})

  var userChars = await ops.findMany(req.db.db('dndgroup'), 'characters_players', {user: ObjectId(req.params.id)})

  console.log('form has been submitted.')
  req.session.sub = null

  var msg
  msg = req.session.message
  req.session.message = null

  var err
  err = req.session.error
  req.session.error = null

  if(thisUser._id.toString() == userSess.user.toString()) {
    var allUsers = await ops.findMany(req.db.db('dndgroup'), 'users', {_id: {$not: {$eq: ObjectId(req.params.id)}}})
    
    var events = await ops.findMany(req.db.db('dndgroup'), 'events', {})
    events.sort(function(a, b){
      if(a.date < b.date) { return -1; }
      if(a.date > b.date) { return 1; }
      return 0;
    });
    res.render('users/dashboard', {
      title: mainHeader,
      loggedUser: true,
      allUsers: allUsers,
      thisUser: thisUser,
      events: events,
      message: msg,
      error: err,
      chars: userChars,
      user: user
    })
    
  } else {
    res.render('users/dashboard', {
      title: mainHeader,
      loggedUser: false,
      thisUser: thisUser,
      chars: userChars,
      message: msg,
      error: err,
      user: user
    })
  }
})

// Dashboard Redir
router.get('/dashboard', authUser(), async function(req, res, next) {
  var currUser = req.session.user
  var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(currUser.id)})

  res.redirect('/users/dashboard/user=' + userSess.user)

})


// Updates profile information
router.post('/updateprofile/:id', ops.authUser('userId'), async function(req, res, next) {
  var form = new formidable.IncomingForm()
  form.parse(req, async function (err, fields, files) {
      var user = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})

      for(var i = 0; i < Object.keys(fields).length; i++) {
          var item = fields[Object.keys(fields)[i]]
          var key = Object.keys(fields)[i]
          if(key != 'profileImage') {
              user[key] = item
              console.log(key)
          }
      }

      if(files.profileImage) {
          var s3User = await ops.findItem(req.db.db('dndgroup'), 'aws-access', {name: 'dndgroup-user-1'})
          var oldpath = fs.readFileSync(files.profileImage.path)
          var data = await ops.uploadFile(s3User, 'dndgroup-user-images', user._id + '-profileImage' + path.extname(files.profileImage.name), oldpath, 'public-read')
          if(data) {
              console.log('Profile image uploaded.')
              user.profileImage = data.Location
              user.profileImageKey = data.Key
          }
          req.session.user.profileImage = data.Location
      }

      var newUser = await ops.updateItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)}, {$set: user})
      
      if(newUser) {
          console.log('Profile update')
          res.send('success')
      } else {
          console.log('Error updating profile')
          res.send('error')
      }
  })
})

// New Password Pages
router.get('/newpass/user=:id', authUser('userId'), async function(req, res, next) {
  var currUser = req.session.user
  var thisUser = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})
  
  res.render('users/newPassword', {
    title: mainHeader,
    loggedUser: true,
    thisUser: thisUser,
    user: currUser
  })
})

router.post('/newpass/user=:id', authUser('userId'), async function(req, res, next) {
  var user = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})

  var form = new formidable.IncomingForm()
  form.parse(req, async function (err, fields, files) {
    user.password = hash.generate(fields.password)
    var updated = await ops.updateItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(user._id)}, {$set: user})
    if(updated) {
      console.log('Password Updated')

      req.session.message = 'Password Changed'
      req.session.sub = true
      req.session.fields = fields

      res.redirect('/users/dashboard/user=' + user._id)
    } else {
      console.log('Update error. Password not changed')

      req.session.errors = 'Error setting new password'
      req.session.sub = true
      req.session.fields = fields

      res.redirect('/users/newpass')
    }
  })
  

})


// New user character form
router.get('/newcharacter/user=:id', authUser('userId'), async function(req, res, next) {
  var thisUser = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})
  var races = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'races'})
  var classes = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'classes'})
  var backgrounds = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'backgrounds'})
  var alignments = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'alignments'})

  var fields = {}
  if(req.session.fields) {
    fields = req.session.fields
    req.session.fields = null
  }

  res.render('users/newCharacter', {
    title: mainHeader,
    fields: fields,
    races: races,
    classes: classes,
    backgrounds: backgrounds,
    alignments: alignments,
    thisUser: thisUser,
    user: req.session.user
  })
})

// Creates new character
router.post('/newcharacter/user=:id', authUser('userId'), async function(req, res, next) {
  var user = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})
  
  var form = new formidable.IncomingForm()
  form.parse(req, async function (err, fields, files) {
    var charId = new ObjectId()
    
    fields.user = ObjectId(user._id)
    fields._id = charId
    fields.wealth = 1000
    fields.maxWeight = 100
    fields.equipment = {}

    if(files.artWork.size > 0) {
      var s3User = await ops.findItem(req.db.db('dndgroup'), 'aws-access', {name: 'dndgroup-user-1'})
      var oldpath = fs.readFileSync(files.artWork.path)
      var data = await ops.uploadFile(s3User, 'dnd-character-images', charId + '-artWork' + path.extname(files.artWork.name), oldpath, 'public-read')
      if(data) {
          console.log('Profile image uploaded.')
          fields.artWork = data.Location
          fields.artWorkKey = data.Key
      }
    }

    await ops.addToDatabase(req.db.db('dndgroup'), 'characters_players', [fields])

    req.session.message = 'Character Created!'
    req.session.sub = true

    res.redirect('/users/newcharacter/shop/char=' + charId + '/user=' + req.params.id)
    
    // res.redirect('/users/dashboard/user=' + req.params.id)

    // res.send([fields, files])

  })

})

router.get('/newcharacter/shop/char=:char/user=:id', authUser('userId'), async function( req, res, next) {
  var character = await ops.findItem(req.db.db('dndgroup'), 'characters_players', {_id: ObjectId(req.params.char)})
  var user = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})
  var shop = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'Initial Shop'})

  for(var i = 0; i < shop.items.length; i++) {
    var id = shop.items[i]
    var item = await ops.findItem(req.db.db('dndgroup'), 'world-items', {_id: ObjectId(id)})
    shop.items[i] = item
  }

  res.render('users/shop', {
    title: mainHeader,
    char: character,
    shop: shop,
    user: user
  })

})


// Loads character page
router.get('/character=:id', authUser(), async function(req, res, next) {
  var char = await ops.findItem(req.db.db('dndgroup'), 'characters_players', {_id: ObjectId(req.params.id)})
  var owner = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(char.user)})
  var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(req.session.user.id)})

  var isOwner = false
  if(char.user.toString() == userSess.user.toString()) {
    isOwner = true
  }

  res.render('users/character', {
    title: mainHeader,
    char: char,
    isOwner: isOwner,
    owner: owner,
    user: req.session.user
  })

})

// Loads character edit page
router.get('/edit/character=:id', authUser(), async function(req, res, next) {
  var char = await ops.findItem(req.db.db('dndgroup'), 'characters_players', {_id: ObjectId(req.params.id)})
  var owner = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(char.user)})
  var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(req.session.user.id)})

  var isOwner = false
  if(char.user.toString() == userSess.user.toString()) {
    isOwner = true
  }

  if(isOwner || userSess.access.includes('super') || userSess.access.includes('admin')) {
    var races = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'races'})
    var classes = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'classes'})
    var backgrounds = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'backgrounds'})
    var alignments = await ops.findItem(req.db.db('dndgroup'), 'game_data', {name: 'alignments'})

    var gameSession = {activities:[]}

    res.render('users/editCharacter', {
      title: mainHeader,
      fields: char,
      owner: owner,
      races: races,
      classes: classes,
      backgrounds: backgrounds,
      alignments: alignments,
      gameSession: gameSession,
      user: req.session.user
    })
  } else {
    req.session.error = 'You do not permission to edit that character.'
    req.session.sub = true
    res.redirect('/users/dashboard')

  }

  

})

// Updates character info
router.post('/edit/character=:id', authUser(), async function(req, res, next) {
  var char = await ops.findItem(req.db.db('dndgroup'), 'characters_players', {_id: ObjectId(req.params.id)})
  var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(req.session.user.id)})

  var isOwner = false
  if(char.user.toString() == userSess.user.toString()) {
    isOwner = true
  }

  if(isOwner  || userSess.access.includes('super') || userSess.access.includes('admin')) {
    var form = new formidable.IncomingForm()
    form.parse(req, async function (err, fields, files) {
      await ops.updateItem(req.db.db('dndgroup'), 'characters_players', {_id: ObjectId(req.params.id)}, {$set: fields})
      res.redirect('/users/character=' + req.params.id)
    })
  } else {
    req.session.error = 'You do not permission to edit that character.'
    req.session.sub = true
    res.redirect('/users/dashboard')
  }
})

// Shows characters by all users
router.get('/allcharacters', authUser(), async function(req, res, next) {
  var playerChars = await ops.findMany(req.db.db('dndgroup'), 'characters_players', {})
  var owners = {}

  playerChars.sort(function(a, b){
    if(a.user < b.user) { return -1; }
    if(a.user > b.user) { return 1; }
    return 0;
  });

  for(var i = 0; i < playerChars.length; i++) {
    var char = playerChars[i]
    if(owners[char.user]) {
      char.user = owners[char.user]
    } else {
      char.user = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(char.user)})
      owners[char.user._id] = char.user
    }
    
  }

  res.render('users/allCharacters', {
    title: mainHeader,
    playerChars: playerChars,
    user: req.session.user
  })
})

module.exports = router;
