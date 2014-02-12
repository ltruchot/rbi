BaseView = require '../lib/base_view'
BankStatementView = require "./bank_statement"
module.exports = class MonthlyAnalysisView extends BaseView

  template: require('./templates/monthly_analysis')

  el: 'div#interface-box'

  subViews: []

  currentMonthStart: ''

  events:
    'click .month-switcher' : 'switchMonth'
    'click #credits-search-btn' : 'searchAllCredits'
    'click #debits-search-btn' : 'searchAllDebits'

  initialize: ->
    @bankStatementView = new BankStatementView $('#context-box')

  render: ->
    # lay down the template
    super()

    #trigger a switch month action
    @switchMonth()

    @

  searchAllCredits: ->
    $('#search-text').val "#credits"
    $('#search-text').keyup()

  searchAllDebits: ->
    $('#search-text').val "#debits"
    $('#search-text').keyup()


  switchMonth: (event) ->
    $('#search-text').val ""
    if event? and event.currentTarget?
      jqSwitcher = $(event.currentTarget)
      if jqSwitcher.hasClass 'previous-month'
        @currentMonthStart.subtract('months', 1).startOf 'month'
      else if jqSwitcher.hasClass 'next-month'
        @currentMonthStart.add('months', 1).startOf('month')
    else
      @currentMonthStart = moment(new Date()).startOf('month')
    @$("#current-month").html @currentMonthStart.format "MMMM YYYY"
    if window.rbiActiveData.bankAccount?
      monthlyAmounts = @getAmountsByMonth @currentMonthStart
      @displayMonthlyAmounts monthlyAmounts.previous, monthlyAmounts.next
      bankStatementParams =
        dateFrom: @currentMonthStart
        dateTo: moment(@currentMonthStart).endOf 'month'
      @bankStatementView.reload bankStatementParams, @displayMonthlySums
      @displayPieChart()


  displayMonthlyAmounts: (previous, next) ->
    currency = window.rbiActiveData.currency.entity
    differential = next - previous
    sign = ''
    $("#amount-month-start").html previous.money() + currency
    $("#amount-month-end").html next.money() + currency
    $("#amount-month-differential").empty()
    if (not isNaN differential) and differential isnt 0
      if differential > 0
        sign = '+'
        iconEvolution = $('<span class="fs1 plain-icon-blue" aria-hidden="true" data-icon="&#57641;"></span>')
      else
        iconEvolution = $('<span class="fs1 plain-icon-red" aria-hidden="true" data-icon="&#57643;"></span>')
      $("#amount-month-differential").append iconEvolution
      $("#amount-month-differential").append sign + differential.money() + currency

  displayMonthlySums: (operations) ->
    credits = 0
    debits = 0
    fixedCost = 0
    variableCost = 0
    if operations?
      currency = window.rbiActiveData.currency.entity
      for key, operation of operations
        if operation.amount > 0
          credits += operation.amount
        else
          debits += operation.amount
        if operation.isFixedCost and operation.amount < 0
          fixedCost += operation.amount
        else if (not operation.isFixedCost) and operation.amount < 0
          variableCost += operation.amount
    $('#credits-sum').html credits.money() + currency
    $('#debits-sum').html (Math.abs(debits)).money() + currency
    $('#fixed-cost-sum').html (Math.abs(fixedCost)).money() + currency
    $('#variable-cost-sum').html (Math.abs(variableCost)).money() + currency


  displayPieChart: ->

    $border_color = "#efefef"
    $grid_color = "#ddd"
    $default_black = "#666"
    $green = "#8ecf67"
    $yellow = "#fac567"
    $orange = "#F08C56"
    $blue = "#87ceeb"
    $red = "#f74e4d"
    $teal = "#28D8CA"
    $grey = "#999999"
    dataTable = [
      ['Task', 'Hours per Day']
      ['Eat', 4]
      ['Work', 3]
      ['Commute', 5]
      ['Read', 3]
      ['Sleep', 6]
      ['Play', 2]
    ]
    data = google.visualization.arrayToDataTable dataTable

    options =
      width: 'auto'
      height: '160'
      backgroundColor: 'transparent'
      colors: [$blue, $teal, $green, $red, $yellow, $orange, $grey],
      tooltip:
        textStyle:
          color: '#666666'
          fontSize: 11
        showColorCode: true
      legend:
        position: 'left'
        textStyle:
          color: 'black'
          fontSize: 12

      chartArea:
        left: 0
        top: 10
        width: "100%"
        height: "100%"
    chart = new google.visualization.PieChart(document.getElementById 'pie_chart')
    chart.draw data, options

  getAmountsByMonth: (monthStart)->
    nextAmount = (window.rbiActiveData.bankAccount.get 'amount') || null
    nextDate = null
    previousAmount = nextAmount
    previousDate = null
    monthEnd = moment(monthStart).endOf('month')
    currentAmounts = window.collections.amounts.models
    monthlyAmounts = []
    if currentAmounts? and currentAmounts.length > 0
      for amount in currentAmounts
        currentDate = moment(amount.get 'date')

        #get next amount
        if currentDate > monthEnd and currentDate <= moment()
          if nextDate? and (currentDate < nextDate)
            nextAmount = amount.get 'amount'
            previousAmount = nextAmount
            nextDate = moment(amount.get 'date')
          else if not nextDate?
            nextDate = moment(amount.get 'date')

        #get previous amount
        else if currentDate >= monthStart and currentDate <= monthEnd
          if previousDate? and (currentDate < previousDate)
            previousAmount = amount.get 'amount'
            previousDate = moment(amount.get 'date')
          else if not previousDate?
            previousDate = moment(amount.get 'date')

    # console.log 'next date = ' + moment(nextDate).format "DD/MM/YY"
    # console.log 'next amount =' + nextAmount
    # console.log 'previous date = ' + moment(previousDate).format "DD/MM/YY"
    # console.log 'previous amount = ' + previousAmount



    monthlyAmounts =
      next: parseFloat nextAmount
      previous: parseFloat previousAmount