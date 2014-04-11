Receipt = require "../models/receipt"

module.exports.newest = (req, res) ->
  Receipt.newest (err, instances) ->
    if err?
      res.send 500, "An error has occurred -- " + err
    else
      res.send 200, instances
    return

  return