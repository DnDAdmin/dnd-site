var aws = require('aws-sdk')
var fs = require('fs');
const {ObjectId} = require('mongodb');
const hash = require('password-hash')

function authUser(access) {
    return async (req, res, next) => {
        next()
        // console.log('Checking user access.')
        // var loggedUser = req.session.user
        // if(loggedUser) {
        //     var user = await findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(loggedUser.id)})
        //     if(user) {
        //         if(hash.verify(loggedUser.key, user.sessions[loggedUser.index].key)) {
        //             if(user.access.includes('super')) {
        //                 console.log('Super-User Access')
        //                 next()
        //             } else {
        //                 if(access) {
        //                     if(access != 'super') {
        //                         if(user.access.includes('admin')) {
        //                             console.log('Admin-User Access')
        //                             next()
        //                         }
        //                     }
        //                     if(access == 'userId') {
        //                         var id = req.params.id

        //                         userSess = await findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(req.session.user.id)})

        //                         if(userSess.user.toString() == id) {
        //                             console.log('User ID Access Permitted')
        //                             next()
        //                         } else {
        //                             console.log('User does not have access.')
        //                             req.session.sub = true
        //                             req.session.error = 'You do not have access to that page.'
        //                             res.redirect('/users/dashboard')
        //                         }
        //                     } else {
        //                         if(user.access.includes(access)) {
        //                             console.log('Access Permitted')
        //                             next()
        //                         } else {
        //                             console.log('User does not have access.')
        //                             res.send('Access Denied')
        //                         }
        //                     }
                            
        //                 } else {
        //                     console.log('Access beyond user login not needed.')
        //                     next()
        //                 }
        //             }
        //         } else {
        //             console.log('Key mismatch')
        //             req.session.user = null
        //             req.session.errors = 'User session keys do not match. Please log in again.'
        //             req.session.sub = true
        //             res.redirect('/users/login')
        //         }
        //     } else {
        //         console.log('No userSession')
        //         req.session.user = null
        //         req.session.errors = 'Session Expired, please log in.'
        //         req.session.sub = true
        //         res.redirect('/users/login')
        //     }
        // } else {
        //     console.log('No user.')
        //     req.session.redir = req.protocol + '://' + req.get('host') + req.originalUrl
        //     req.session.user = null
        //     req.session.errors = 'You must be logged in to view that page.'
        //     req.session.sub = true
        //     res.redirect('/users/login')
        // }     
    }
}

 function verifyGame() {
    return async (req, res, next) => {
        console.log('Verifying game session')
        var userSess = await findItem(req.db.db('dndgroup'), 'userSessions', {_id: ObjectId(req.session.user.id)})
        var gameSession = await findItem(req.db.db('dndgroup'), 'game_sessions', {active: true})
        
        if(gameSession) {
            var quest = await findItem(req.db.db('dndgroup'), 'game_quests', {_id: ObjectId(gameSession.quest)})
            if(quest.players[userSess.user]) {
                console.log('Sessions verified. Coninueing...')
                next()
            } else {
                if(quest.dm == userSess.user) {
                    console.log('Sessions verified (DM Access). Coninueing...')
                    next()
                } else {
                    console.log('User not on player list.')
                    req.session.sub = true
                    req.session.error = 'You are not part of the current quest. If you believe you should be, contact the group DM.'
                    res.redirect('/users/dashboard/user=' + userSess.user)
                }
            }
        } else {
            console.log('No active game session.')
            req.session.sub = true
            req.session.error = 'There must be an active game session for you to view that page.'
            res.redirect('/users/dashboard/user=' + userSess.user)
        }
    }
}

function getRandom (db, col, cond, count) {
    return new Promise(async resolve => {
        console.log('Getting Random Items in database.')
        var info
        info = await db.collection(col).aggregate([{$match: cond}, {$sample: {size: count}}]).toArray()
        resolve(info)
    })
}

function addToDatabase (db, col, data) {
    return new Promise(resolve => {
        console.log('Adding item to database.')
        db.collection(col).insertMany(data, function(err, items) {
            if (err) throw err
            console.log('Item added to database.')
            resolve(items.ops)
        })
    })
}

function updateItem (db, col, item, data) {
    return new Promise(resolve => {
        console.log('Updating item in database.')
        db.collection(col).updateMany(item, data, function(err, result) {
            if (err) throw err
            console.log('Item updated.')
            resolve(result)
        })
    })
}

function findItem(db, col, data, index) {
    return new Promise(async resolve => {
        console.log('Getting Item in database.')
        var info
        if(index) {
            info = await db.collection(col).find(data).collation(index).limit(1).toArray()
        } else {
            info = await db.collection(col).find(data).limit(1).toArray()
        }
        resolve(info[0])
    })   
}

function findMany(db, col, data) {
    return new Promise(resolve => {
        console.log('Getting items in database.')
        var info = db.collection(col).find(data).toArray()
        resolve(info)
    })
}

function getCollection(db, col, data) {
    return new Promise(resolve => {
        console.log('Getting collection in database.')
        var info = db.collection(col).find(data).toArray()
        resolve(info)
    })
}

function deleteItem(db, col, data) {
    return new Promise(resolve => {
        console.log('Deleteing item in database')
        var info = db.collection(col).deleteOne(data)
        resolve(info)
    })
}

async function connectS3(user) {
    return new Promise(async resolve => {
        
        aws.config.update({
            accessKeyId: user.keyId,
            secretAccessKey: user.accessKey
        })
        resolve(new aws.S3({apiVersion: '2006-03-01'}))
    })
}

function uploadFile(user, bucket, key, body, acl) {
    return new Promise(async resolve => {
        console.log('Uploading to AWS.')

        var s3 = await connectS3(user)

        var params = {
            Bucket: bucket,
            Key: key,
            Body: body,
            ACL: acl
        }
        
        s3.upload (params, async function (err, data) {
            if (err) throw err
            console.log(key + ' uploaded to AWS.')
            resolve(data)
        });
    })
}

function downloadFile(user, bucket, key, path) {
    return new Promise(async resolve => {
        console.log('Downloading from AWS.')

        var s3 = await connectS3(user)

        var params = {
            Bucket: bucket,
            Key: key
        }

        s3.getObject(params, (err, data) => {
            if (err) console.error(err);
            fs.writeFileSync(path, data.Body);
            console.log(key + ' downloaded from AWS.')
            resolve(data)
        });

    })
}

function deleteFile(user, bucket, key) {
    return new Promise(async resolve => {
        console.log('Deleting file from AWS.')
        
        var s3 = await connectS3(user)

        var delParams = {
            Bucket: bucket,
            Key: key
        }

        s3.deleteObject(delParams, function (err, data) {
            if (err) throw err
            console.log(key + ' deleted from AWS.')
            resolve(data)
        });
    })
}

module.exports = {getRandom, addToDatabase, updateItem, findItem, findMany, getCollection, deleteItem, uploadFile, downloadFile, deleteFile, authUser, verifyGame }