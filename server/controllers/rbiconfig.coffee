Config = require '../models/rbiconfig'

module.exports.setConfig = (req, res) ->
    Config.set req.body, (err, config) ->
        if err?
            res.send 500, error: "Server error while setting config."
        else
            res.send 201, config

module.exports.getConfig = (req, res) ->
    Config.get (err, config) ->
        if err?
            res.send 500, error: "Server error while setting config."
        else
            res.send 200, config