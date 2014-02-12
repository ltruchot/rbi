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
    'click #fixed-cost-search-btn' : 'searchAllFixedCost'
    'click #variable-cost-search-btn' : 'searchAllVariableCost'

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

  searchAllFixedCost: ->
    $('#search-text').val "#frais-fixes"
    $('#search-text').keyup()

  searchAllVariableCost: ->
    $('#search-text').val "#depenses"
    $('#search-text').keyup()


  switchMonth: (event) ->

    #prepare month limit
    currentMonth = moment(new Date()).startOf('month').format "YYYY-MM-DD"
    firstMonth = moment(window.rbiActiveData.olderOperationDate).startOf('month').format "YYYY-MM-DD"


    $('#search-text').val ""
    if event? and event.currentTarget?
      jqSwitcher = $(event.currentTarget)
      if jqSwitcher.hasClass 'previous-month'
        @currentMonthStart.subtract('months', 1).startOf 'month'
      else if jqSwitcher.hasClass 'next-month'
        @currentMonthStart.add('months', 1).startOf('month')
    else
      @currentMonthStart = moment(new Date()).startOf('month')

    #show/hide previous/next month button
    if (@currentMonthStart.format "YYYY-MM-DD") is currentMonth
      $('.next-month').hide()
    else
      $('.next-month').show()
    if (firstMonth isnt currentMonth) and (@currentMonthStart.format("YYYY-MM-DD") is firstMonth)
      $('.previous-month').hide()
    else
      $('.previous-month').show()

    @$("#current-month").html @currentMonthStart.format "MMMM YYYY"
    if window.rbiActiveData.bankAccount?
      monthlyAmounts = @getAmountsByMonth @currentMonthStart
      @displayMonthlyAmounts monthlyAmounts.previous, monthlyAmounts.next
      bankStatementParams =
        dateFrom: @currentMonthStart
        dateTo: moment(@currentMonthStart).endOf 'month'
      @bankStatementView.reload bankStatementParams, (operations)=>
        @displayMonthlySums operations
        @displayPieChart operations
        $(window).resize =>
          @displayPieChart operations


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
        if $("#amount-month-differential").hasClass "red-text"
          $("#amount-month-differential").removeClass("red-text").addClass "blue-text"
      else
        if $("#amount-month-differential").hasClass "blue-text"
          $("#amount-month-differential").removeClass("blue-text").addClass "red-text"
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


  displayPieChart: (operations)->
    $('#pie_chart').empty()
    chartColors = []
    operationType =
      cheque:
        name: "Chèques"
        amount: 0
        color: "#87ceeb"
      commerceElectronique:
        name: "Achats en ligne"
        amount: 0
        color : "#8ecf67"
      retrait:
        name: "Retraits"
        amount: 0
        color : "#fac567"
      carte:
        name: "CB"
        amount: 0
        color : "#F08C56"
      autre:
        name: "Autres"
        amount: 0
        color : "#b0b0b0"

    for id, operation of operations
      if operation.amount < 0
        raw = operation.raw.toLocaleUpperCase()
        amount = Math.abs operation.amount
        if (raw.search /COMMERCE ELECTRONIQUE$/) >= 0
          operationType.commerceElectronique.amount += amount
        else if (raw.search /^CHEQUE/) >= 0
          operationType.cheque.amount += amount
        else if (raw.search /^CARTE[^R]*RETRAIT DAB (\d{2})\/(\d{2}) (\d{2})H(\d{2})/) >= 0
          operationType.retrait.amount += amount
        else if (raw.search /^CARTE X\d{4} (\d{2})\/(\d{2})/) >= 0
          operationType.carte.amount += amount
        else
          operationType.autre.amount += amount

    dataTable = [['Type', 'Montant']]
    for type, obj of operationType
      if obj.amount > 0
        dataTable.push [obj.name, obj.amount]
        chartColors.push obj.color
    if dataTable.length > 2

      data = google.visualization.arrayToDataTable dataTable

      options =
        width: 'auto'
        height: '160'
        backgroundColor: 'transparent'
        colors: chartColors
        tooltip:
          textStyle:
            color: '#666666'
            fontSize: 11
          showColorCode: true
        legend:
          position: 'right'
          textStyle:
            color: 'black'
            fontSize: 12
        pieSliceText: 'value'

        chartArea:
          left: 0
          top: 10
          width: "100%"
          height: "100%"
      chart = new google.visualization.PieChart document.getElementById('pie_chart')
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