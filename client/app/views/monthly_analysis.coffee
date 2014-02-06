BaseView = require '../lib/base_view'
BankStatementView = require "./bank_statement"
module.exports = class MonthlyAnalysisView extends BaseView

  template: require('./templates/monthly_analysis')

  el: 'div#interface-box'

  subViews: []

  currentMonthStart: ''

  events:
    'click .month-switcher' : 'switchMonth'


  initialize: ->
    @bankStatementView = new BankStatementView $('#context-box')
    @bankStatementView.render()

  render: ->
    # lay down the template
    super()
    view = @
    @currentMonthStart = moment(new Date()).startOf('month')
    @$("#current-month").html @currentMonthStart.format "MMMM YYYY"
    if window.rbiActiveData.bankAccount?
      monthlyAmounts = @getAmountsByMonth @currentMonthStart
      diffAmounts = monthlyAmounts.next - monthlyAmounts.previous
      $("#monthly-amounts").html 'solde de début de mois : ' + monthlyAmounts.previous.money() + ' / solde de fin de mois : ' + monthlyAmounts.next.money() + ' (' +  diffAmounts + ')'
    @displayPieChart()
    @

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



  switchMonth: (event) ->
    jqSwitcher = $(event.currentTarget)
    if jqSwitcher.hasClass 'previous-month'
      @currentMonthStart.subtract('months', 1).startOf('month')
    else if jqSwitcher.hasClass 'next-month'
      @currentMonthStart.add('months', 1).startOf('month')
    @$("#current-month").html @currentMonthStart.format "MMMM YYYY"
    monthlyAmounts = @getAmountsByMonth @currentMonthStart
    diffAmounts = monthlyAmounts.next - monthlyAmounts.previous
    $("#monthly-amounts").html 'solde de début de mois : ' + monthlyAmounts.previous.money() + ' / solde de fin de mois : ' + monthlyAmounts.next.money() + '(' + diffAmounts + ')'

  getAmountsByMonth: (monthStart)->
    nextAmount = (window.rbiActiveData.bankAccount.get 'amount') || null
    nextDate = null
    previousAmount = nextAmount
    previousDate = null
    monthEnd = monthStart.clone().endOf('month')
    currentAmounts = window.collections.amounts.models
    monthlyAmounts = []
    if currentAmounts.length > 0
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