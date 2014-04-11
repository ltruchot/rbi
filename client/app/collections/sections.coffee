Section = require("../models/section")
module.exports = class Sections extends Backbone.Collection
  initialize: (models, options) ->
    @receiptId = options.receiptId
    return

  url: ->
    "receipts/" + @receiptId + "/sections"

  model: Section
