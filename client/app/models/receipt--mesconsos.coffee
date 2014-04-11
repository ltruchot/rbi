Receipt = require('../models/receipt');
module.exports = Receipts = Backbone.Collection.extend({
    model: Receipt,
    url: 'receipts'
})