BaseView = require '../lib/base_view'
ReceiptCollection = require "../collections/receipts"
ReceiptView = require './receipt'
BankStatementView = require "./bank_statement"

module.exports = class EnhancedReportView extends BaseView


  template: require('./templates/enhanced_report')

  el: 'div#interface-box'

  @currentReceipt = null


  initialize: ->
    @allReceipts = new ReceiptCollection()

  render: ->
    @bankStatementView = new BankStatementView $('#context-box')
    now = new Date()
    bankStatementParams =
      accounts: [window.rbiActiveData.accountNumber]
      amountFrom: Number.NEGATIVE_INFINITY
      amountTo: Number.POSITIVE_INFINITY
      dateFrom: moment(moment(now).subtract('y', 1)).format 'YYYY-MM-DD'
      dateTo: moment(now).format 'YYYY-MM-DD'
    @bankStatementView.enhancedLinked = true
    @bankStatementView.reload bankStatementParams

    @allReceipts.fetch
      success: (receipts) =>
        if receipts.models[0]? and receipts.models[0].get("timestamp")?
          @displayReceipt receipts.models[0].get("timestamp")
        else
          $('#enhanced-report-info').show()


    # lay down the template
    super()
    view = @

    @

  displayReceipt: (receiptTs) ->
    foundModel = @allReceipts.where
      timestamp: receiptTs
    if foundModel[0]?
      @currentReceipt = new ReceiptView foundModel[0]
      @currentReceipt.render()
      console.log @currentReceipt
      currentTs = moment(@currentReceipt.model.get "timestamp")
      currentNbOfArticles = @currentReceipt.model.get "articlesCount"
      currentTotal = @currentReceipt.model.get("total").money()
      date = currentTs.format 'DD/MM/YYYY'
      time = currentTs.format('HH') + "h" + currentTs.format('mm')
      newTitle = "Ticket du " + date + " à " + time + " : " + currentNbOfArticles + " Art. / " + currentTotal
      @$el.find("h1").html newTitle
      @$el.find("#current-receipt").html @currentReceipt.$el

