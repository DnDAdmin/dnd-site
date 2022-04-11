'use-strict'

const axios = require('axios');

module.exports = () => {
    return (req, res, next) => {
        const apiUrl = 'https://www.dnd5eapi.co'

        req.useAPI = (path) => {
            return new Promise(async (resolve, reject) => {
                const thisUrl = apiUrl + path
                await axios({
                    method: 'get',
                    url: thisUrl
                }).then(function(response) {
                    resolve(response.data)
                }).catch(function(error) {
                    reject(error)
                }).then(function() {
                    console.log(`HTTP got ${thisUrl}`)
                })
            })
            
        }

        next()
    }
}