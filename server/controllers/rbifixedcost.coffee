FixedCost = require '../models/rbifixedcost'

module.exports.setFixedCost = (req, res) ->
    FixedCost.set req.body, (err, config) ->
        if err?
            res.send 500, error: "Server error while setting config."
        else
            res.send 201, config

module.exports.getFixedCost = (req, res) ->
    FixedCost.get (err, config) ->
        if err?
            res.send 500, error: "Server error while setting config."
        else
            res.send 200, config