americano = require 'americano'

module.exports = FixedCost = americano.getModel 'RbiFixedCost',
    idTable: Object
    type: String
    accountNumber: String
    uniquery: String

FixedCost.get = (callback) ->
    FixedCost.request 'all', (err, fixedCosts) ->
        return callback err if err
        callback null, fixedCosts

FixedCost.set = (hash, callback) ->
    FixedCost.request 'all', (err, fixedCosts) ->
        return callback err if err
        alreadyExist = false
        for cost in fixedCosts
            if cost.uniquery? and cost.uniquery isnt "" and cost.uniquery is hash.uniquery
                alreadyExist = true
                cost.updateAttributes hash, callback
        if not alreadyExist
            FixedCost.create hash, callback

