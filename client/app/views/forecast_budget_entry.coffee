BaseView = require '../lib/base_view'
module.exports = class ForecastBudgetEntryView extends BaseView

  template: require './templates/forecast_budget_entry'

  tagName: 'tr'

  events:
    "click .toogle-monthly-budget" : "toogleMonthlyBudget"
    "click .remove-regular-operation" : "removeRegularOperation"
    "click td:eq(0),td:eq(1)" : "modifyRegularOperation"
    'mouseenter td:eq(0), td:eq(1) ' : "showHighlighting"
    'mouseleave td:eq(0), td:eq(1) ' : "hideHighlighting"

  rules: {}

#     #mouse interaction with cost type icon
#     'mouseenter .popup-container > .variable-cost' : 'switchFixedCostIcon'
#     'mouseleave .popup-container > .variable-cost' : 'switchFixedCostIcon'
#     'mouseenter .popup-container > .fixed-cost' : 'switchFixedCostIcon'
#     'mouseleave .popup-container > .fixed-cost' : 'switchFixedCostIcon'
#     'click .popup-container > .variable-cost' : 'popupFixedCost'
#     'click .popup-container > .fixed-cost' : 'popupFixedCost'

#     #mouse interaction with popup buttons
#     'click #cancel-fixed-cost' : 'destroyPopupFixedCost'
#     'click #save-fixed-cost' : 'prepareFixedCost'
#     'click #remove-fixed-cost' : 'removeFixedCost'


  #--------------------------- BEGIN BACKBONE METHODS --------------------------
  constructor: (@model) ->
    super()

  render: ->

    if @model.get("uniquery")?
      @rules = @deserializeUniquery @model.get("uniquery")
      @addAverageToRules()
      @addAlreadyPaidToRules()
      @model.set "rules", @rules
    super()
    if not @model.get("isBudgetPart")
         @$el.find("em").hide()
    @
  #---------------------------- END BACKBONE METHODS ---------------------------


  #---------------------------- BEGIN EVENTS METHODS ---------------------------
  toogleMonthlyBudget: (event) ->
    isBudgetPart = $(event.currentTarget).is ":checked"
    #post new fixed cost object
    $.ajax
      type: "PUT"
      url: "rbifixedcost/" + @model.get "id"
      data:
        isBudgetPart: isBudgetPart

      success: (objects) =>
        window.views.forecastBudgetView.displayRegularOperations()
      error: (err) ->
        console.log "There was an error during saving regular operation process"

  showHighlighting: (event) ->
    jqTr = $(event.currentTarget).closest "tr"
    jqTr.addClass "highlighted-rule"

  hideHighlighting: (event) ->
    jqTr = $(event.currentTarget).closest "tr"
    jqTr.removeClass "highlighted-rule"

  modifyRegularOperation: (currentEvent) ->
    $("#search-regular-operations").val @rules.queryPattern
    if (@rules.queryMax? and (@rules.queryMax isnt "")) then $("#search-min-amount").val parseFloat(@rules.queryMin).toFixed(2)
    if (@rules.queryMax? and (@rules.queryMax isnt "")) then $("#search-max-amount").val parseFloat(@rules.queryMax).toFixed(2)
    $("#search-regular-operations").keyup()

  deserializeUniquery: (uniquery)->
    queryParts = []
    rules = {}

    if uniquery? and ((typeof uniquery) is "string")
      queryParts = uniquery.split("(#|#)")

    rules.queryAccountNumber = queryParts[0] or ""
    rules.queryPattern = queryParts[1] or ""
    rules.queryMin = if (queryParts[2]? and (queryParts[2] isnt "NEGATIVE_INFINITY")) then Number(queryParts[2]) else null
    rules.queryMax = if (queryParts[3]? and (queryParts[3] isnt "POSITIVE_INFINITY")) then Number(queryParts[3]) else null

    return rules

  addAverageToRules: ->
    idTable = @model.get "idTable"
    allOperationsById = window.rbiActiveData.allOperationsById
    mid = 0
    count = 0
    addedAmounts = 0
    if idTable? and allOperationsById? and idTable.length > 0
      for id in idTable
        if allOperationsById[id]?
          addedAmounts += allOperationsById[id].amount
          count++
    if addedAmounts isnt 0
      mid = addedAmounts / count
    @rules.queryMid = mid
    @rules.textQueryMid = if mid > 0 then "+" + mid.money() else mid.money()

  addAlreadyPaidToRules: ->
    idTable = @model.get "idTable"
    allOperationsById = window.rbiActiveData.allOperationsById
    startOfMonth = moment(new Date()).startOf "month"
    @rules.alreadyPaid = false
    @rules.textAlreadyPaid = "non"
    if idTable? and allOperationsById? and idTable.length > 0
      for id in idTable
        if allOperationsById[id]? and moment(allOperationsById[id].date) > moment(startOfMonth)
          sum = allOperationsById[id].amount
          @rules.alreadyPaid = true
          @rules.textAlreadyPaid = if sum > 0 then "+" + sum.money() else sum.money()
          @rules.alreadyPaidSum = sum



  removeRegularOperation: (event) ->
    regularOperationId = (@model.get "id") or null
    if regularOperationId?
      $.ajax
          url: '/rbifixedcost/' + regularOperationId
          type: 'DELETE'
          success: (result) =>
            window.views.forecastBudgetView.newRegularOperationsChecked = false
            window.views.forecastBudgetView.displayRegularOperations()
            $('#search-regular-operations').keyup()

          error: ->
            console.log "Delete fixed cost failed."
#----------------------------- END EVENTS METHODS ----------------------------


#------------------- BEGIN SERVER COMMUNICATION METHODS ----------------------
#-------------------- END SERVER COMMUNICATION METHODS -----------------------
