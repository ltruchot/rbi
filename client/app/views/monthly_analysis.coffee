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
    if (moment(@currentMonthStart).format "YYYY-MM-DD") is currentMonth
      $('.next-month').hide()
    else
      $('.next-month').show()
    if (firstMonth isnt currentMonth) and (moment(@currentMonthStart).format("YYYY-MM-DD") is firstMonth)
      $('.previous-month').hide()
    else
      $('.previous-month').show()

    @$("#current-month").html moment(@currentMonthStart).format "MMMM YYYY"
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
    differential = next - previous
    sign = ''
    $("#amount-month-start").html previous.money()
    $("#amount-month-end").html next.money()
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
      $("#amount-month-differential").append sign + differential.money()

  displayMonthlySums: (operations) ->
    credits = 0
    debits = 0
    fixedCost = 0
    variableCost = 0
    if operations?
      for key, operation of operations
        if operation.amount > 0
          credits += operation.amount
        else
          debits += operation.amount
        if operation.isFixedCost and operation.amount < 0
          fixedCost += operation.amount
        else if (not operation.isFixedCost) and operation.amount < 0
          variableCost += operation.amount
    $('#credits-sum').html credits.money()
    $('#debits-sum').html (Math.abs(debits)).money()
    $('#fixed-cost-sum').html (Math.abs(fixedCost)).money()
    $('#variable-cost-sum').html (Math.abs(variableCost)).money()

  displayPieChart: (operations)->
    $('#pie_chart').empty()
    chartColors = []
    operationTypes =
      withdrawals:
        name: "Retraits"
        amount: 0
        color: "#8ecf67"
        patterns: [
          /^CARTE \w+ RETRAIT DAB.* (0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012]).*/g
          /^CARTE \w+ (0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012]).* RETRAIT DAB.*/g
          /^CARTE RETRAIT .*/g
          /RETRAIT DAB (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012]).*/g
        ]
        #"^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/[0-9]{4} ([01][0-9]|2[0-3]):([0-5][0-9])$"
        #------------------------------PYTHON PATTERNS:-------------------------
        #-------- Société générale
        # '^CARTE \w+ RETRAIT DAB.* (?P<dd>\d{2})/(?P<mm>\d{2})( (?P<HH>\d+)H(?P<MM>\d+))? (?P<text>.*)'
        # '^CARTE \w+ (?P<dd>\d{2})/(?P<mm>\d{2})( A (?P<HH>\d+)H(?P<MM>\d+))? RETRAIT DAB (?P<text>.*)'
        # '^CARTE RETRAIT (?P<text>.*)'
        #-------- Crédit coopératif / Banque postale
        # '^(?P<text>RETRAIT DAB) (?P<dd>\d{2})-(?P<mm>\d{2})-([\d\-]+)'
        # '^RETRAIT DAB (?P<dd>\d{2})-(?P<mm>\d{2})-([\d\-]+) (?P<text>.*)'

      payback:
        name: 'Remboursements'
        amount: 0
        color: "#fac567"
        patterns: [
          /^CARTE \w+ REMBT (0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012]).*/g
        ]
        #------------------------------PYTHON PATTERNS--------------------------
        #-------- Société générale
        # '^CARTE \w+ REMBT (?P<dd>\d{2})/(?P<mm>\d{2})( A (?P<HH>\d+)H(?P<MM>\d+))? (?P<text>.*)'

      carte:
        name: "CB"
        amount: 0
        color : "#F08C56"
        patterns: [
          /^CARTE \w+ (0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012]) .*/g
          /^CARTE (0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012]).* \d+ .*/g
        ]
        #------------------------------PYTHON PATTERNS:-------------------------
        #-------- Société générale
        # '^(?P<category>CARTE) \w+ (?P<dd>\d{2})/(?P<mm>\d{2}) (?P<text>.*)'
        # '^(?P<dd>\d{2})(?P<mm>\d{2})/(?P<text>.*?)/?(-[\d,]+)?$'
        #-------- Crédit coopératif / Banque postale
        # '^CARTE (?P<dd>\d{2})(?P<mm>\d{2}) \d+ (?P<text>.*)'

      orders:
        name: 'Prélèvements'
        amount: 0
        color: "#87ceeb"
        patterns: [
          /^(COTISATION|PRELEVEMENT|TELEREGLEMENT|TIP) .*/g
          /^(PRLV|PRELEVEMENT) .*$/g
          /^.* QUITTANCE .*/g
        ]
        #------------------------------PYTHON PATTERNS:-------------------------
        #-------- Société générale
        # '^(?P<category>(COTISATION|PRELEVEMENT|TELEREGLEMENT|TIP)) (?P<text>.*)'
        #-------- Crédit coopératif / Banque postale
        # '^(PRLV|PRELEVEMENT) (?P<text>.*?)(- .*)?$'
        # '^(?P<text>.*)( \d+)? QUITTANCE .*'

      transfer:
        name: 'Virements'
        amount: 0
        color: "#f74e4d"
        patterns: [
          /^(\d+ )?VIR (PERM )?POUR: (.*?) (REF: \d+ )?MOTIF: (.*)/g
          /^(VIR(EMEN)?T?) \w+ (.*)/g
          /^VIR COOPA (0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012]) (.*)/g
          /^VIR(EMENT|EMT)? (.*?)(- .*)?$/g

        ]
        #------------------------------PYTHON PATTERNS:-------------------------
        #-------- Société générale
        #'^(\d+ )?VIR (PERM )?POUR: (.*?) (REF: \d+ )?MOTIF: (?P<text>.*)'
        #'^(?P<category>VIR(EMEN)?T? \w+) (?P<text>.*)'
        #-------- Crédit coopératif / Banque postale
        #'^VIR COOPA (?P<dd>\d{2})/(?P<mm>\d{2}) (?P<text>.*)'
        #'^VIR(EMENT|EMT)? (?P<text>.*?)(- .*)?$'

      check:
        name: "Chèques"
        amount: 0
        color: "#28D8CA"
        patterns: [
          /^(CHEQUE) (.*)/g
          /^CHEQUE.*/g
        ]
        #------------------------------PYTHON PATTERNS:-------------------------
        #-------- Société générale
        #'^(CHEQUE) (?P<text>.*)'
        #-------- Crédit coopératif / Banque postale
        #'^CHEQUE.*'

      bank:
        name: "Frais bancaires"
        amount: 0
        color: "#8E3CBE"
        patterns: [
          /^(FRAIS) (.*)/g
          /^(AGIOS \/|FRAIS) (.*)/g
          /^ABONNEMENT (.*)/g
        ]
        #------------------------------PYTHON PATTERNS:-------------------------
        #-------- Société générale
        #'^(FRAIS) (?P<text>.*)'
        #-------- Crédit coopératif / Banque postale
        # '^(AGIOS /|FRAIS) (?P<text>.*)'
        # '^ABONNEMENT (?P<text>.*)'

      loan_payment:
        name: "Prêts"
        amount: 0
        color: '#CF68C1'
        patterns: [
          /^ECHEANCEPRET(.*)/g
        ]
        #------------------------------PYTHON PATTERNS:-------------------------
        #-------- Société générale
        #'^(?P<category>ECHEANCEPRET)(?P<text>.*)'


      deposit:
        name: 'Remise de chèques'
        amount: 0
        color: '#4D3CBE'
        patterns: [
          /^REMISE CHEQUES(.*)/g
          /^REMISE (.*)/g
        ]
        #------------------------------PYTHON PATTERNS:-------------------------
        #-------- Société générale
        #'^(?P<category>REMISE CHEQUES)(?P<text>.*)'
        #-------- Crédit coopératif / Banque postale
        #'^REMISE (?P<text>.*)'

    others =
      name: "Autres"
      amount: 0
      color : "#b0b0b0"

    #loop debit operations
    for id, operation of operations
      if operation.amount < 0
        isKnownType = false
        raw = operation.raw.toLocaleUpperCase()
        amount = Math.abs operation.amount

        #loop operation types
        for type, obj of operationTypes

          #loop pattern by type while type isnt found
          if not isKnownType
            for pattern in obj.patterns
              if raw.search(pattern) >= 0
                obj.amount += amount

                #when type is found, avoid loop
                isKnownType = true
                break

        #if no type was found, tranfer amount to "others" type
        if not isKnownType
          others.amount += amount

    #set common data
    dataTable = [['Type', 'Montant']]

    #set found data by type
    for finalType, finalObj of operationTypes
      if finalObj.amount > 0
        dataTable.push [finalObj.name, finalObj.amount]
        chartColors.push finalObj.color

    #set "others" type
    if others.amount > 0
      dataTable.push [others.name, others.amount]
      chartColors.push others.color

    #create chart with options
    if dataTable.length > 2

      data = google.visualization.arrayToDataTable dataTable
      numberformatter = new google.visualization.NumberFormat
          suffix: '€'
          decimalSymbol: ','
          fractionDigits: ' '

      numberformatter.format data, 1
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
          left: 20
          top: 20
          height: "180"
          width: "300"
      chart = new google.visualization.PieChart document.getElementById('pie_chart')
      chart.draw data, options

  getAmountsByMonth: (monthStart)->

    monthlyAmounts = []

    #set month start and end
    monthStart = moment(monthStart)
    monthEnd = moment(moment(monthStart).endOf 'month')

    #prepare previous and next var
    nextAmount = (window.rbiActiveData.bankAccount.get 'amount') || null
    previousAmount = nextAmount
    nextDate = null
    previousDate = null

    #get current amounts
    currentAmounts = window.collections.amounts.models

    if currentAmounts? and currentAmounts.length > 0
      for amount in currentAmounts
        currentDate = moment(amount.get 'date')

        #get next amount
        if currentDate > monthEnd and currentDate <= moment()
          if not nextDate?
            nextDate = moment(amount.get 'date')
          if currentDate < nextDate
            nextAmount = amount.get 'amount'
            previousAmount = nextAmount
            nextDate = moment(amount.get 'date')

        #get previous amount
        else if currentDate >= monthStart and currentDate <= monthEnd
          if (not previousDate?) or (currentDate < previousDate)
            previousAmount = amount.get 'amount'
            previousDate = moment(amount.get 'date')

    monthlyAmounts =
      next: parseFloat nextAmount
      previous: parseFloat previousAmount