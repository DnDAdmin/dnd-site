var nodemailer = require('nodemailer');
var time = new Date(Date.now())

function emailVar(req) {
  return new Promise(resolve => {
    var emailURL
    if(req.get('Host').substring(0, 9) !== 'localhost') {
      emailURL = 'https://dnd-group.herokuapp.com/'
    } else {
      emailURL = 'http://localhost:8000'
    }
    resolve(emailURL)
  })
}

function sendMail (options) {
    return new Promise(resolve => {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dndgroupsuper',
                pass: 'ghxdcjwwsqrohdfu'
            }
        });
        console.log('Sending email.')
        transporter.sendMail(options, function(error, info){
          if (error) throw error
          if(info.accepted.length > 0) {
            console.log('Email Sent to ' + options.to)
          } else {
            console.log('Email not sent.')
          }
          resolve(info)
        });
    })
}
module.exports = { sendMail, emailVar }