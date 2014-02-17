americano = require 'americano'

module.exports = RbiConfig = americano.getModel 'RbiConfig',
    accountNumber: String
    budgetByAccount: Object

RbiConfig.get = (callback) ->
    RbiConfig.request 'all', (err, configs) ->
        return callback err if err

        config = configs?[0] or new RbiConfig()
        callback null, config.toJSON()

RbiConfig.set = (hash, callback) ->
    RbiConfig.request 'all', (err, configs) ->
        return callback err if err

        if config = configs?[0]
            config.updateAttributes hash, callback
        else
            RbiConfig.create hash, callback

