BaseView = require '../lib/base_view'
ReceiptCollection = require "../collections/receipts"
ReceiptView = require './receipt'
BankStatementView = require "./bank_statement"

module.exports = class EnhancedReportView extends BaseView


  template: require('./templates/enhanced_report')

  el: 'div#interface-box'

  @currentReceipt = null

  render: ->

    @allReceipts = new ReceiptCollection()
    window.views.appView.cleanBankStatement()
    @bankStatementView = new BankStatementView $('#context-box')
    @bankStatementView.enhancedLinked = true
    @bankStatementView.render()


    @allReceipts.fetch
      success: (receipts) =>
        # if receipts.models[0]?
        #   @displayReceipt receipts.models[0]
        # else
        #   $('#enhanced-report-info').show()


        now = new Date()
        bankStatementParams =
          accounts: [window.rbiActiveData.accountNumber]
          amountFrom: Number.NEGATIVE_INFINITY
          amountTo: Number.POSITIVE_INFINITY
          dateFrom: moment(moment(now).subtract('y', 1)).format 'YYYY-MM-DD'
          dateTo: moment(now).format 'YYYY-MM-DD'
        @bankStatementView.reload bankStatementParams
        @bankStatementView.$el.find(".search-field").remove()
        @bankStatementView.$el.find(".context-box-header").append '<p class="light-info">Selectionnez une opération pour consulter le ticket de caisse intermarché qui lui est associé.</p>'


    # lay down the template
    super()

    @

  displayReceipt: (receiptModel) ->
    if receiptModel?
      @currentReceipt = new ReceiptView receiptModel
      @currentReceipt.render()

      currentTs = moment(@currentReceipt.model.get "timestamp")
      currentNbOfArticles = @currentReceipt.model.get "articlesCount"
      currentTotal = @currentReceipt.model.get("total").money()
      date = currentTs.format 'DD/MM/YYYY'
      time = currentTs.format('HH') + "h" + currentTs.format('mm')
      newTitle = "Ticket du " + date + " à " + time + " : " + currentNbOfArticles + " Art. / " + currentTotal
      @$el.find("h1").html newTitle
      @$el.find("#current-receipt").html @currentReceipt.$el

