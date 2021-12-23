var ops = require('./databaseOps')

async function error(req, res, msg, trace, url, subMsg) {
    var error = {
        msg: msg,
        trace: trace,
        url: url,
        subMsg: subMsg,
        date: new Date(Date.now()),
        viewed: false
    }
    await ops.addToDatabase(req.db.db('dndgroup'), 'site_errors', [error])
    req.session.error = error
    res.redirect('/error')
}

module.exports = {error}