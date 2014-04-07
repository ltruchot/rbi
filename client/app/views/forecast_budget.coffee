BaseView = require '../lib/base_view'
ForecastBudgetEntryView = require "./forecast_budget_entry"
RegularOpStatementView = require "./regular_op_statement"

module.exports = class ForcastBudgetView extends BaseView

  template: require './templates/forecast_budget'

  el: 'div#interface-box'
  elRegularOperations: '#regular-operations'
  currentChart: null
  #events:

  #     'click a.recheck-button' : "checkAccount"
  #     'click th.sort-date' : "sortByDate"
  #     'click th.sort-title' : "sortByTitle"
  #     'click th.sort-amount' : "sortByAmount"
  #     'keyup input#search-text' : "reload"

  # inUse: false

  # subViews: []

  # subViewLastDate = ''

  # params = null

  # # INIT
  # constructor: (@el) ->
  #     super()

  initialize: ->
    window.views.regularOpStatementView = new RegularOpStatementView $('#context-box')


  render: ->
    # lay down the template
    super()
    view = @
    accountNumber = window.rbiActiveData.accountNumber or null
    if accountNumber? and (accountNumber isnt "")
      @displayRegularOperations accountNumber
      window.views.regularOpStatementView.reload()
    @

  reloadBudget: ->
    currentBudget = 0
    budgetExpenses = 0
    for regularOperation in @subViews
      if regularOperation.rules? and regularOperation.rules.queryMid? and regularOperation.model.get "isBudgetPart"
        if regularOperation.rules.queryMid > 0
          currentBudget += regularOperation.rules.queryMid
        else if regularOperation.rules.queryMid < 0
          budgetExpenses += regularOperation.rules.queryMid
    budgetExpenses = Math.abs budgetExpenses
    percentage = parseInt((budgetExpenses / currentBudget) * 100)
    percentage = if percentage <= 100 then percentage else 100
    rest = currentBudget - budgetExpenses
    $('#current-budget-chart-debit').html rest.money()
    $('#current-budget-chart').attr 'data-percent', percentage
    if @currentChart?
      $('#current-budget-chart').data('easyPieChart').update percentage
    else
      @currentChart = $('#current-budget-chart').easyPieChart
        animate: 1500
        barColor: window.rbiColors.blue
        trackColor: window.rbiColors.border_color
        scaleColor: window.rbiColors.blue
        lineWidth: 2
    $("#regular-operations-budget").remove()
    trToInject = '<tr id="regular-operations-budget">' +
      "\t" + "<td><strong>Budget total</strong></td>" +
      "\t" + "<td><strong>" + rest.money() + "<strong></td>" +
      "\t" + "<td>&nbsp;</td>" +
      "\t" + "<td>&nbsp;</td>" +
      '</tr>'
    $("tbody#regular-operations").append trToInject

  displayRegularOperations: (accountNumber) ->
    if (not accountNumber?) and window.rbiActiveData.accountNumber?
      accountNumber = window.rbiActiveData.accountNumber
    window.collections.regularOperations.reset()
    window.collections.regularOperations.setAccount accountNumber
    window.collections.regularOperations.fetch
      success: (regularOperations, rawData) =>

        # remove the previous ones
        @subViews = []
        $(@elRegularOperations).empty()

        # and render all of them
        for operation in regularOperations.models

          # add the operation to the table
          subView = new ForecastBudgetEntryView operation

          $(@elRegularOperations).append subView.render().el
          @subViews.push subView
        @reloadBudget()

        error: ->
          console.log "error fetching regular operations"



    # reload: (params, callback) ->
    #     view = @

    #     #client or server search ?
    #     # isClientSearch = false
    #     # if params.clientSearch
    #     #     isClientSearch = true


    #     @model = window.rbiActiveData.bankAccount

    #     #server search
    #     if params? and params.dateFrom?
    #         @params = params
    #     if @model?
    #         @updateFilters()
    #         if @$("#table-operations").length is 0
    #             @$el.html @templateHeader
    #                 model: @model

    #     displayFixedCosts = if @data? then (@data.fixedCosts or false) else false
    #     displayVariableCosts = if @data? then (@data.variableCosts or false) else false


    #     if @send
    #         $.ajax
    #             type: "POST"
    #             url: "bankoperations/byDate"
    #             data: @data
    #             success: (operations) ->
    #                 #console.log "sent successfully!"
    #                 # console.log objects
    #                 if operations
    #                     $.ajax
    #                         type: "GET"
    #                         url: "rbifixedcost"
    #                         success: (fixedCosts) =>
    #                             #console.log "getting fixed cost success."
    #                             window.rbiActiveData.currentOperations = {}
    #                             finalOperations = []
    #                             for operation, index in operations
    #                                 operation.isRegularOperation = false
    #                                 if operation.amount < 0
    #                                     for fixedCost in fixedCosts
    #                                         if $.inArray(operation.id, fixedCost.idTable) >= 0
    #                                             operation.isRegularOperation = true
    #                                             operation.fixedCostId = fixedCost.id
    #                                             break

    #                                 #adjustement for fixed/variable cost search
    #                                 operationRemoved = false
    #                                 if (displayFixedCosts and (not operation.isRegularOperation))
    #                                     operationRemoved = true
    #                                 else if (displayVariableCosts and (operation.isRegularOperation or (operation.amount > 0)))
    #                                     operationRemoved = true
    #                                 if not operationRemoved
    #                                     finalOperations.push operation
    #                                     window.rbiActiveData.currentOperations[operation.id] = operation

    #                             if callback?
    #                                 callback window.rbiActiveData.currentOperations
    #                             window.collections.operations.reset finalOperations
    #                             view.addAll()
    #                         error: (err) ->
    #                             console.log "getting fixed cost failed."
    #                 else
    #                     window.collections.operations.reset()

    #             error: (err) ->
    #                 console.log "there was an error"
    #                 if callback?
    #                     callback null


    # updateFilters: ->
    #     # console.log '----------------------'
    #     # console.log 'update filter params :'
    #     # console.log @params
    #     # get elements
    #     if @params?
    #         dateFrom = if @params.dateFrom then moment(@params.dateFrom).format 'YYYY-MM-DD' else null
    #         dateTo = if @params.dateTo then moment(@params.dateTo).format 'YYYY-MM-DD' else null

    #      # check that there are things to send
    #     unless dateFrom or dateTo
    #        #console.log "Empty query"
    #        @send = false
    #        window.collections.operations.reset()
    #        return
    #     else
    #        @send = true

    #     if window.rbiActiveData.bankAccount?
    #         accountNumber = window.rbiActiveData.bankAccount.get 'accountNumber'
    #     else
    #         @send = false

    #     # get values
    #     dateFromVal = new Date(dateFrom or null)
    #     dateToVal = new Date(dateTo or new Date())

    #     # store the results
    #     @data =
    #         dateFrom:   dateFromVal
    #         dateTo:     dateToVal
    #         accounts:   [accountNumber]

    #     searchTextVal = $("input#search-text").val()
    #     if searchTextVal? and (searchTextVal isnt "")
    #         if searchTextVal is "#credits"
    #             @data.credits = true
    #         else if searchTextVal is "#debits"
    #             @data.debits = true
    #         else if searchTextVal is "#frais-fixes"
    #             @data.fixedCosts = true
    #         else if searchTextVal is "#depenses"
    #             @data.variableCosts = true
    #         else
    #             @data.searchText = searchTextVal


    # addAll: ->
    #     # remove the previous ones
    #     @$("#table-operations").html ""
    #     @$(".loading").remove()
    #     for view in @subViews
    #         view.destroy()
    #     @subViews = []

    #     #if none return
    #     if window.collections.operations.models.length is 0
    #         $("#table-operations").append $('<tr><td>Aucune opération ne correspond à ces critères.</td></tr>')
    #         return

    #     # and render all of them
    #     for operation, index in window.collections.operations.models

    #         # add the operation to the table
    #         subView = new BalanceOperationView operation, @model
    #         subViewDate = subView.render().model.get 'date'

    #         #insert day row in table
    #         if (@subViewLastDate isnt subViewDate) or (index is 0)
    #             @subViewLastDate = subViewDate
    #             @$("#table-operations").append $('<tr class="special"><td colspan="4">' + moment(@subViewLastDate).format "DD/MM/YYYY" + '</td></tr>')
    #         @$("#table-operations").append subView.render().el

    # destroy: ->
    #     @viewTitle?.destroy()
    #     for view in @subViews
    #         view.destroy()
    #     super()
