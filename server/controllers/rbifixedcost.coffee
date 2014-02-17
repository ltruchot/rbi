RbiFixedCost = require '../models/rbifixedcost'

module.exports.setFixedCost = (req, res) ->
    RbiFixedCost.set req.body, (err, fixedCost) ->
        if err?
            res.send 500, error: "Server error while setting fixed cost."
        else
            res.send 201, fixedCost

module.exports.getFixedCost = (req, res) ->
    RbiFixedCost.get (err, fixedCost) ->
        if err?
            res.send 500, error: "Server error while setting fixed cost."
        else
            res.send 200, fixedCost

module.exports.loadFixedCost = (req, res, next, fixedCostID) ->
    RbiFixedCost.find fixedCostID, (err, fixedCost) =>
        if err? or not fixedCost?
            res.send 404, error: "Bank Alert not found"
        else
            @fixedCost = fixedCost
            next()

module.exports.destroy = (req, res) ->
    @fixedCost.destroy (err) ->
        if err?
            res.send 500, error: "Server error while deleting the fixed cost"
        else
            res.send 204, success: true

module.exports.update = (req, res) ->
    @fixedCost.updateAttributes req.body, (err, fixedCost) ->
        if err?
            res.send 500, error: "Server error while saving bank alert"
        else
            res.send 200, fixedCost

module.exports.show = (req, res) ->
    res.send 200, @fixedCost
