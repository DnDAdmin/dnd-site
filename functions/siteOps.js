var ops = require('./databaseOps')

async function error(req, res, msg, trace, url, subMsg) {
    var error = {
        status: null,
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

async function saveSiteErr(req, err) {
    var newErr = {
        status: err.status,
        msg: err.message,
        trace: null,
        url: err.url,
        subMsg: err.stack,
        date: new Date(Date.now()),
        viewed: false
    }
    await ops.addToDatabase(req.db.db('dndgroup'), 'site_errors', [newErr])
}

module.exports = {error, saveSiteErr}