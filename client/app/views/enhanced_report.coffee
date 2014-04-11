BaseView = require '../lib/base_view'
ReceiptCollection = require "../collections/receipts"
module.exports = class EnhancedReportView extends BaseView

  template: require('./templates/enhanced_report')

  el: 'div#interface-box'

  subViews: []

  initialize: ->
    @allReceipts = new ReceiptCollection()

  render: ->
    @allReceipts.fetch
      success: (receipts) =>
        @displayReceipt()


    # lay down the template
    super()
    view = @

    @

  displayReceipt: (receiptId) ->
    foundModel = @allReceipts.where
      id: "da9d63cdfbd38a0fbd77ab2414003508"
    if foundModel[0]?
      for attr, value of foundModel[0].attributes
        @$el.append(attr + " : " + value + '<br />')

