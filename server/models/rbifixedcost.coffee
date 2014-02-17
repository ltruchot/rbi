americano = require 'americano'

module.exports = RbiFixedCost = americano.getModel 'RbiFixedCost',
    idTable: Object
    type: String
    accountNumber: String
    uniquery: String

RbiFixedCost.get = (callback) ->
    RbiFixedCost.request 'all', (err, fixedCosts) ->
        return callback err if err
        callback null, fixedCosts

RbiFixedCost.set = (hash, callback) ->
    RbiFixedCost.request 'all', (err, fixedCosts) ->
        return callback err if err
        alreadyExist = false
        for cost in fixedCosts
            if cost.uniquery? and cost.uniquery isnt "" and cost.uniquery is hash.uniquery
                alreadyExist = true
                cost.updateAttributes hash, callback
        if not alreadyExist
            RbiFixedCost.create hash, callback

