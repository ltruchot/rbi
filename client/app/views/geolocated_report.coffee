BaseView = require '../lib/base_view'
RegularOpStatementView = require "./regular_op_statement"

module.exports = class GeolocatedReportView extends BaseView

  template: require './templates/geolocated_report'

  el: 'div#interface-box'

  initialize: ->
    window.views.regularOpStatementView = new RegularOpStatementView $('#context-box')


  render: ->

    $.ajax
      type: "POST"
      url: "geolocationlog/allByDate"
      data:
        dateFrom: new Date("2013-09-01")
        dateTo: new Date("2013-09-02")
      success: (geolocationLogs) ->
        console.log geolocationLogs

    # lay down the template
    super()

    # #needed variables
    # view = @
    # accountNumber = window.rbiActiveData.accountNumber or null

    # #view and subviews
    # if accountNumber? and (accountNumber isnt "")

    #   @getOperationByRegularType ->

    #     #display subviews
    #     view.displayRegularOperations accountNumber

    #   #display contextual contents
    #   window.views.regularOpStatementView.reload()

    @


  # displayRegularOperations: (accountNumber) ->

  #   view = @
  #   if (not accountNumber?) and window.rbiActiveData.accountNumber?
  #     accountNumber = window.rbiActiveData.accountNumber


  #   window.collections.regularOperations.reset()
  #   window.collections.regularOperations.setAccount accountNumber
  #   window.collections.regularOperations.fetch
  #     success: (regularOperations, rawData) =>

  #       # remove the previous ones
  #       @subViews = []
  #       $(@elRegularOperations).empty()

  #       # and render all of them
  #       for operation in regularOperations.models

  #         # add the operation to the table
  #         subView = new ForecastBudgetEntryView operation

  #         $(@elRegularOperations).append subView.render().el
  #         @subViews.push subView

  #       if @newRegularOperationsChecked
  #         @reloadBudget()
  #       else
  #         @getOperationByRegularType ->
  #           view.reloadBudget()



  #       error: ->
  #         console.log "error fetching regular operations"

  # getOperationByRegularType: (callback) ->
  #   view = @
  #   accountNumber = window.rbiActiveData.accountNumber
  #   @monthlyRegularOperations = []
  #   @monthlyVariableOperations = []
  #   @variableOperationsTotal = 0

  #   #get montlhy operations
  #   currentMonthStart = moment(new Date()).startOf('month')
  #   monthlyOperationsParams =
  #     dateFrom: currentMonthStart.format "YYYY-MM-DD"
  #     dateTo: moment(currentMonthStart).endOf('month').format "YYYY-MM-DD"
  #     accounts: [accountNumber]
  #     amountFrom: Number.NEGATIVE_INFINITY
  #     amountTo: Number.POSITIVE_INFINITY

  #   $.ajax
  #     type: "POST"
  #     url: "bankoperations/byDate"
  #     data: monthlyOperationsParams
  #     success: (operations) =>
  #       if operations?
  #         $.ajax
  #           type: "GET"
  #           url: "rbifixedcost"
  #           success: (fixedCosts) =>
  #             for operation, index in operations
  #               operation.isRegularOperation = false
  #               for fixedCost in fixedCosts
  #                 if $.inArray(operation.id, fixedCost.idTable) >= 0
  #                   operation.isRegularOperation = true
  #                   break
  #               if operation.isRegularOperation
  #                 @monthlyRegularOperations.push operation
  #               else
  #                 @monthlyVariableOperations.push operation

  #             for varOperation in @monthlyVariableOperations
  #               @variableOperationsTotal += varOperation.amount

  #             view.newRegularOperationsChecked = true
  #             if callback?
  #               callback()

  # reloadBudget: ->

  #   currentBudget = 0

  #   #already budget applied regular expenses

  #   #get variable expenses
  #   variableExpenses = @monthlyVariableExpenses


  #   #prepare regular expenses
  #   regularExpenses = 0
  #   for regularOperation in @subViews
  #     if regularOperation.rules? and regularOperation.rules.queryMid? and regularOperation.model.get "isBudgetPart"
  #       if regularOperation.rules.queryMid > 0
  #         currentBudget += regularOperation.rules.queryMid
  #       else if regularOperation.rules.queryMid < 0
  #         regularExpenses += regularOperation.rules.queryMid
  #   regularExpenses = Math.abs regularExpenses

  #   #reload widget data
  #   percentage = parseInt((regularExpenses / currentBudget) * 100)
  #   percentage = if percentage <= 100 then percentage else 100
  #   monthlyBudget = currentBudget - regularExpenses
  #   realBudget = monthlyBudget + @variableOperationsTotal
  #   $("#account-budget-amount").html monthlyBudget.money()
  #   $('#current-budget-chart-debit').html realBudget.money()
  #   $('#current-budget-chart').attr 'data-percent', percentage
  #   if @currentChart?
  #     $('#current-budget-chart').data('easyPieChart').update percentage
  #   else
  #     @currentChart = $('#current-budget-chart').easyPieChart
  #       animate: 1500
  #       barColor: window.rbiColors.blue
  #       trackColor: window.rbiColors.border_color
  #       scaleColor: window.rbiColors.blue
  #       lineWidth: 2

  #   #reload budget table row
  #   $("#regular-operations-budget").remove()
  #   trToInject = '<tr id="regular-operations-budget">' +
  #     "\t" + "<td><strong>Budget total</strong></td>" +
  #     "\t" + "<td><strong>" + monthlyBudget.money() + "<strong></td>" +
  #     "\t" + "<td>&nbsp;</td>" +
  #     "\t" + "<td>&nbsp;</td>" +
  #     '</tr>'
  #   $("tbody#regular-operations").append trToInject
