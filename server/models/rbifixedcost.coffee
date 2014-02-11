americano = require 'americano'

module.exports = FixedCost = americano.getModel 'RbiFixedCost',
    query: Object
    idTable: Object
    type: String

FixedCost.get = (callback) ->
    FixedCost.request 'all', (err, configs) ->
        return callback err if err

        config = configs?[0] or new FixedCost()
        callback null, config.toJSON()

FixedCost.set = (hash, callback) ->
    FixedCost.request 'all', (err, fixedCosts) ->
        return callback err if err
        alreadyExist = false
        for cost in fixedCosts
            if cost.query? and cost.query = hash.query
                alreadyExist = true
                cost.updateAttributes hash, callback
        if not alreadyExist
            FixedCost.create hash, callback

