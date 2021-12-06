var express = require('express');
var router = express.Router();
const { sendMail } = require('../functions/emailOps')
var ops = require('../functions/databaseOps')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const {ObjectId} = require('mongodb');

var mainHeader = 'Lore Seekers | '

/* Contact me form */
router.get('/contact', async function(req, res, next) {
    var succ
    succ = req.session.success
    req.session.success = null

    res.render('contact', {
        title: mainHeader,
        success: succ,
        user: req.session.user
    })
})

// submits contact me form
router.post('/contact', async function(req, res, next) {
    var form = new formidable.IncomingForm()
    form.parse(req, async function (err, fields, files) {
        var mailOptions = {
            from: fields.name + ' - Via Site <' + fields.email + '>',
            to: 'main.nrjohnson@gmail.com',
            subject: 'Message From ' + fields.name,
            html: '<p>From: ' + fields.name + ' (' + fields.email + ')<br>' + fields.details
        };
        await sendMail(mailOptions)
        req.session.success = true
        res.redirect('/forms/contactme')
    })
})
  
// Commission Request Page
router.get('/commission', async function(req, res, next) {
    var siteData = await ops.findItem(req.db.db('nrjsites'), 'data', {name: 'Site Data'})
    var succ
    succ = req.session.success
    req.session.success = null

    res.render('commission', {
        title: mainHeader,
        data: siteData,
        success: succ
    })
})

// submits commission form
router.post('/commission', async function(req, res, next) {
    var form = new formidable.IncomingForm()
    var files = []
    var fields = []
    var attachments = []
    form.uploadDir = __dirname + '/uploads';
    form.on('field', function(field, value) {
        fields.push([field, value]);
    })
    form.on('file', function(field, file) {
        console.log(file.name);
        files.push(file);
    })

    form.parse(req, async function (err, fields, images) {
        
        if(files.length > 0) {
            for(var i = 0; i < files.length; i ++) {
                var file = files[i]
                if(file.size > 0) {
                    attachments.push({
                        filename: file.name,
                        path: file.path
                    })
                }
            }
        }
        var mailOptions
        if(attachments.length < 1) {
            mailOptions = {
                from: fields.name + ' - Via Site <' + fields.email + '>',
                to: 'main.nrjohnson@gmail.com',
                subject: 'New Commission From ' + fields.name,
                html: '<p>From: ' + fields.name + ' (' + fields.email + ')<p>Package: ' + fields.package + '</p><p>Files: None</p><p>Agree to terms: ' + fields.agreeToTerms + '</p><hr>' + fields.details,
            };
        } else {
            mailOptions = {
                from: fields.name + ' - Via Site <' + fields.email + '>',
                to: 'main.nrjohnson@gmail.com',
                subject: 'New Commission From ' + fields.name,
                html: '<p>From: ' + fields.name + ' (' + fields.email + ')<p>Package: ' + fields.package + '</p><p>Files: ' + attachments.length + '</p><p>Agree to terms: ' + fields.agreeToTerms + '</p>' + fields.details,
                attachments: attachments
            };
        }

        
        await sendMail(mailOptions)
        var folder = './routes/uploads'
        fs.readdir(folder, (err, files) => {
            if (err) throw err;
            for (const file of files) {
                fs.unlink(path.join(folder, file), err => {
                if (err) throw err;
                });
            }
        });
        req.session.success = true
        res.redirect('commission')
    })
})


// Checks if item is already used
router.post('/checkfordbitem', async function(req, res, next) {
    var used = await ops.findItem(req.db.db('dndgroup'), 'users', {$and: [{[req.body.key]: req.body.value}, {_id: {$not: {$eq: ObjectId(req.body.exempt)}}}]})
    if(used) {
      res.send('true')
    } else {
      res.send('false')
    }
})

// Updates profile information
router.post('/updateprofile/:id', ops.authUser(), async function(req, res, next) {
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


module.exports = router;
