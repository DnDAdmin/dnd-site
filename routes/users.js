var express = require('express');
var router = express.Router();
const formidable = require('formidable')
const hash = require('password-hash')
var ops = require('../functions/databaseOps')
const {ObjectId} = require('mongodb');
const { authUser, findItem } = require('../functions/databaseOps');

var mainHeader = 'Lore Seekers | '

// Login Page
router.get('/login', async function(req, res, next) {
  if(req.session.user) {
    var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(req.session.user.id)})
    res.redirect('/users/dashboard/user=' + userSess.user)
  } else {
    if(req.session.sub) {
      console.log('form has been submitted.')
      req.session.sub = null

      var err
      err = req.session.errors
      req.session.errors = null

      var fields = {}
      if(req.session.fields) {
        fields = req.session.fields
        req.session.fields = null
      }

      console.log(err)

      res.render('secure/login', {
        title: mainHeader,
        fields: fields,
        errors: err
      })

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
          var tempId = new ObjectId()
          var key = Math.floor(100000 + Math.random() * 900000).toString()
          var hashedKey = hash.generate(key)
          var date = new Date(Date.now())

          var tempUser = {
            name: user.name,
            _id: tempId,
            user: new ObjectId(user._id),
            key: hashedKey,
            date: date,
            nrj: true
          }

          await ops.deleteItem(req.db.db('dndgroup'), 'userSessions', {$and: [{user: ObjectId(user._id)}, {nrj: true}]})
          console.log('Any old session removed from database.')
          
          var dbUserSession = await ops.addToDatabase(req.db.db('dndgroup'), 'userSessions', [tempUser])
          if(dbUserSession) {
            console.log('User session made.')
            
            req.session.user = {
              userName: user.userName,
              id: tempId,
              key: key,
              profileImage: user.profileImage,
              permissions: user.access
            }
            console.log('User session made.')
            // res.send(req.session.user)
            res.redirect('/users/dashboard/user=' + user._id)


          } else {
            console.log('error making db session.')
            error('Error trying to find user in database.')
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
  await ops.deleteItem(req.db.db('users'), 'userSessions', {_id: req.session.user.id})
  req.session.user = null
  res.redirect('/users/login')
})

// ------ Pages ------

// Dashboard
router.get('/dashboard/user=:id', authUser(), async function(req,res,next) {
  var thisUser = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})

  var currUser = req.session.user
  var userSess = await ops.findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(currUser.id)})
  var user = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(userSess.user)})

  var allUsers = null

  if(thisUser._id.toString() == userSess.user.toString()) {
    if(user.access.includes('super') || user.access.includes('admin')) {
      allUsers = await ops.findMany(req.db.db('dndgroup'), 'users', {_id: {$not: {$eq: ObjectId(req.params.id)}}})
    }

    if(req.session.sub) {
      console.log('form has been submitted.')
      req.session.sub = null
  
      var msg
      msg = req.session.message
      req.session.message = null

      res.render('users/dashboard', {
        title: mainHeader,
        loggedUser: true,
        message: msg,
        allUsers: allUsers,
        thisUser: thisUser,
        user: user
      })
    } else {
      res.render('users/dashboard', {
        title: mainHeader,
        loggedUser: true,
        allUsers: allUsers,
        thisUser: thisUser,
        user: user
      })
    }
    
  } else {
    res.render('users/dashboard', {
      title: mainHeader,
      loggedUser: false,
      thisUser: thisUser,
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

// Dashboard Redir
router.get('/newpass/user=:id', authUser(), async function(req, res, next) {
  var currUser = req.session.user
  var thisUser = await ops.findItem(req.db.db('dndgroup'), 'users', {_id: ObjectId(req.params.id)})
  
  res.render('users/newPassword', {
    title: mainHeader,
    loggedUser: true,
    thisUser: thisUser,
    user: currUser
  })
})

router.post('/newpass/user=:id', authUser(), async function(req, res, next) {
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


module.exports = router;
