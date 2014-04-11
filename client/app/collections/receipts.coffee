Receipt = require '../models/receipt'
module.exports = class Receipts extends Backbone.Collection
  model: Receipt
  url: 'receipts'
