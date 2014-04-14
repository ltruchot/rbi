BaseView = require '../lib/base_view'
ForecastBudgetEntryView = require "./forecast_budget_entry"
RegularOpStatementView = require "./regular_op_statement"

module.exports = class ForcastBudgetView extends BaseView

  template: require './templates/forecast_budget'

  el: 'div#interface-box'

  elRegularOperations: '#regular-operations'

  subViews: []

  currentChart: null

  monthlyVariableOperations: []

  monthlyRegularOperations: []

  variableOperationsTotal: 0

  newRegularOperationsChecked: false

  render: ->

    window.views.appView.cleanBankStatement()
    window.views.regularOpStatementView = new RegularOpStatementView $('#context-box')

    # lay down the template
    super()

    #needed variables
    view = @
    accountNumber = window.rbiActiveData.accountNumber or null

    #view and subviews
    if accountNumber? and (accountNumber isnt "")

      @getOperationByRegularType ->

        #display subviews
        view.displayRegularOperations accountNumber

      #display contextual contents
      window.views.regularOpStatementView.reload()

    @


  displayRegularOperations: (accountNumber) ->

    view = @
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

        if @newRegularOperationsChecked
          @reloadBudget()
        else
          @getOperationByRegularType ->
            view.reloadBudget()



        error: ->
          console.log "error fetching regular operations"

  getOperationByRegularType: (callback) ->
    view = @
    accountNumber = window.rbiActiveData.accountNumber
    @monthlyRegularOperations = []
    @monthlyVariableOperations = []
    @variableOperationsTotal = 0

    #get montlhy operations
    currentMonthStart = moment(new Date()).startOf('month')
    monthlyOperationsParams =
      dateFrom: currentMonthStart.format "YYYY-MM-DD"
      dateTo: moment(currentMonthStart).endOf('month').format "YYYY-MM-DD"
      accounts: [accountNumber]
      amountFrom: Number.NEGATIVE_INFINITY
      amountTo: Number.POSITIVE_INFINITY

    $.ajax
      type: "POST"
      url: "bankoperations/byDate"
      data: monthlyOperationsParams
      success: (operations) =>
        if operations?
          $.ajax
            type: "GET"
            url: "rbifixedcost"
            success: (fixedCosts) =>
              for operation, index in operations
                operation.isRegularOperation = false
                for fixedCost in fixedCosts
                  if $.inArray(operation.id, fixedCost.idTable) >= 0
                    operation.isRegularOperation = true
                    break
                if operation.isRegularOperation
                  @monthlyRegularOperations.push operation
                else
                  @monthlyVariableOperations.push operation


              for varOperation in @monthlyVariableOperations
                @variableOperationsTotal += varOperation.amount

              view.newRegularOperationsChecked = true
              if callback?
                callback()

  reloadBudget: ->


    currentBudget = 0
    realBudget = 0
    regularExpenses = 0
    realExpenses = 0

    for regularOperation in @subViews
      if regularOperation.rules? and regularOperation.rules.queryMid? and regularOperation.model.get "isBudgetPart"

        #forecast
        if regularOperation.rules.queryMid > 0
          currentBudget += regularOperation.rules.queryMid
        else if regularOperation.rules.queryMid < 0
          regularExpenses += regularOperation.rules.queryMid

        #real
        if regularOperation.rules? and regularOperation.rules.alreadyPaid
          if regularOperation.rules.alreadyPaidSum > 0
            realBudget += regularOperation.rules.alreadyPaidSum
          else if regularOperation.rules.alreadyPaidSum < 0
            realExpenses += regularOperation.rules.alreadyPaidSum
        else
          if regularOperation.rules.queryMid > 0
            realBudget += regularOperation.rules.queryMid
          else if regularOperation.rules.queryMid < 0
            realExpenses += regularOperation.rules.queryMid


    regularExpenses = Math.abs regularExpenses
    realExpenses = Math.abs realExpenses

    #prepare percentage for widget
    percentage = parseInt((regularExpenses / currentBudget) * 100)
    percentage = if percentage <= 100 then percentage else 100

    #prepare forecast budget
    forecastBudget = currentBudget - regularExpenses
    roundedForecastBudget = Math.floor((forecastBudget + 5) /10) * 10

    #prepare currently modified budget
    #realBudget = forecastBudget + @variableOperationsTotal
    realBudget = realBudget - realExpenses - @variableOperationsTotal

    #display budgets
    $("#account-budget-amount").html roundedForecastBudget.money()
    $('#current-budget-chart-debit').html realBudget.money()
    $('#current-budget-chart').attr 'data-percent', percentage

    #load or reload widget data
    if @currentChart?
      $('#current-budget-chart').data('easyPieChart').update percentage
    else
      @currentChart = $('#current-budget-chart').easyPieChart
        animate: 1500
        barColor: window.rbiColors.blue
        trackColor: window.rbiColors.border_color
        scaleColor: window.rbiColors.blue
        lineWidth: 2

    #reload budget table row
    $("#regular-operations-budget").remove()
    forecastTitle = "La somme des mouvements d'argent attendus sur votre compte ce mois-ci."
    # realTitle = "La somme des mouvements d'argent réellement survenus ce mois-ci, et de ceux à venir."
    trToInject = '<tr id="regular-operations-budget">' +
      "\t" + "<td><strong title=\"" + forecastTitle + "\">Budget prévisionnel</strong></td>" +
      "\t" + "<td>&#8776; " + roundedForecastBudget.money() + "</td>" +
      # "\t" + "<td><strong title=\"" + realTitle + "\">Affiné </strong></td>" +
      # "\t" + "<td>= " + realBudget.money() + "</td>" +
      "\t" + "<td>&nbsp;</td>" +
      "\t" + "<td>&nbsp;</td>" +
      '</tr>'
    $("tbody#regular-operations").append trToInject
