var aws = require('aws-sdk')
var fs = require('fs');

function authUser(access) {
    return (req, res, next) => {
        console.log('Checking user access.')
        var user = req.session.user
        if(user) {
            if(user.permissions.includes('super')) {
                console.log('Super-User Access')
                next()
            } else {
                if(access) {
                    if(user.permissions.includes(access)) {
                        console.log('Access Permitted')
                        next()
                    } else {
                        console.log('User does not have access.')
                        res.send('Access Denied')
                    }
                } else {
                    console.log('Access beyond user login not needed.')
                    next()
                }
                
            }
        } else {
            console.log('No user.')
            req.session.errors = 'You must be logged in to view that page.'
            req.session.sub = true
            res.redirect('/users/login')
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

module.exports = {getRandom, addToDatabase, updateItem, findItem, findMany, getCollection, deleteItem, uploadFile, downloadFile, deleteFile, authUser }