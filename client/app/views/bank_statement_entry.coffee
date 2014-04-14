BaseView = require '../lib/base_view'

module.exports = class EntryView extends BaseView

  template: require './templates/bank_statement_entry'

  tagName: 'tr'

  events:
    'click' : 'reloadInterface'


  #--------------------------- BEGIN BACKBONE METHODS --------------------------
  constructor: (@model, @account, @showAccountNum = false, @mapLinked, @enhancedLinked) ->
    super()

  render: ->
    if @model.get("amount") > 0
      @$el.addClass "success"
    @model.account = @account
    @model.formattedDate = moment(@model.get('date')).format "DD/MM/YYYY"

    if @showAccountNum
      hint = "#{@model.account.get('title')}, " + \
             "n°#{@model.account.get('accountNumber')}"
      @model.hint = "#{@model.account.get('title')}, " + \
                    "n°#{@model.account.get('accountNumber')}"
    else
      @model.hint = "#{@model.get('raw')}"
    super()

    if @mapLinked or @enhancedLinked
      @$el.find("td").css
        "cursor" : "pointer"
    @

  #---------------------------- END BACKBONE METHODS ---------------------------


  #---------------------------- BEGIN EVENTS METHODS ---------------------------
  reloadInterface: ->
    if @mapLinked
      window.views.geolocatedReportView.switchDay null, new Date(@model.get('date'))
    else if @enhancedLinked
      modelOperation = window.rbiActiveData.currentOperations[@model.get "id"] or null
      if modelOperation? and modelOperation.receiptModel?
        window.views.enhancedReportView.displayReceipt modelOperation.receiptModel

  #----------------------------- END EVENTS METHODS ----------------------------


  #------------------- BEGIN SERVER COMMUNICATION METHODS ----------------------
  saveFixedCost: (fixedCost, callback) ->

    #post new fixed cost object
    $.ajax
        type: "POST"
        url: "rbifixedcost"
        data: fixedCost

        success: (objects) =>

          #set fixed cost status to model
          @model.set "fixedCostId", objects.id
          @model.set "isRegularOperation", true

          #refresh monthly analysis
          for id in fixedCost.idTable
            if window.rbiActiveData.currentOperations[id]?
              window.rbiActiveData.currentOperations[id].isRegularOperation = true
              window.rbiActiveData.currentOperations[id].fixedCostId = fixedCost.id
          window.views.monthlyAnalysisView.displayMonthlySums window.rbiActiveData.currentOperations

          callback()

        error: (err) ->
          console.log "there was an error"
  #-------------------- END SERVER COMMUNICATION METHODS -----------------------
