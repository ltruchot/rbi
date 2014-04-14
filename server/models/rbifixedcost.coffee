americano = require 'americano'

module.exports = RbiFixedCost = americano.getModel 'RbiFixedCost',
    idTable: Object
    type: String
    accountNumber: String
    uniquery: String
    isBudgetPart: Boolean

RbiFixedCost.get = (callback) ->
    RbiFixedCost.request 'all', (err, fixedCosts) ->
        return callback err if err
        callback null, fixedCosts

RbiFixedCost.set = (hash, callback) ->
    RbiFixedCost.request 'all', (err, fixedCosts) ->
        return callback err if err
        alreadyExist = false
        for cost in fixedCosts
            console.log cost.uniquery + " = " + hash.uniquery
            if cost.uniquery? and cost.uniquery isnt "" and cost.uniquery is hash.uniquery
                alreadyExist = true
                cost.updateAttributes hash, callback
        console.log alreadyExist
        if not alreadyExist
            RbiFixedCost.create hash, callback

RbiFixedCost.allByAccountNumber = (accountNumber, callback) ->
    params =
        key: accountNumber
    RbiFixedCost.request "allByAccountNumber", params, callback

