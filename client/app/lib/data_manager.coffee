module.exports = class DataManager

  loadLastYearAmounts: (account, callback) ->
    that = @
    window.collections.amounts.reset()
    window.collections.amounts.setAccount account
    window.collections.amounts.fetch
      success: (amounts) ->
        that.setupLastYearAmountsFlot amounts, account
        $(window).resize () ->
            that.setupLastYearAmountsFlot amounts, account
        if callback? then callback()
      error: ->
        console.log "Error during amounts of last year fetching process"

  setupLastYearAmountsFlot: (amounts, account) ->
    that = @
    formattedAmounts = []
    flotReadyAmounts = []
    daysPerMonth =
      twelve : 365
      six : (365 / 2)
      three : (365 / 4)
    numberOfDays = daysPerMonth.three
    threeMonthAgo = new Date()
    threeMonthAgo = threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3)
    sixMonthAgo = new Date()
    sixMonthAgo = sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
    dayRatio = 4

    amounts.each (amount) ->

        #set older date for other use
        if window.rbiActiveData.olderOperationDate > moment(amount.get 'date') then window.rbiActiveData.olderOperationDate = moment(amount.get 'date')
        currentDate1 = new Date()
        currentDate1.setHours 12,0,0,0
        amountDate = new Date(amount.get 'date')
        amountDate.setHours 12,0,0,0


        dayCounter1 = 0
        while ((amountDate.getTime() isnt currentDate1.getTime()) and (dayCounter1 < 365))
          currentDate1.setDate(currentDate1.getDate() - 1)
          dayCounter1++
        if dayCounter1 < 364
          formattedAmounts[currentDate1.getTime()] = amount.get 'amount'
        if currentDate1.getTime() < threeMonthAgo
          numberOfDays = daysPerMonth.six
        else if currentDate1.getTime() < sixMonthAgo
          numberOfDays = daysPerMonth.twelve


    currentDate = new Date()
    currentDate.setHours 12,0,0,0
    minAmount = minAmount = maxAmount = parseFloat account.get('amount')

    dayCounter2 = 0
    while dayCounter2 < numberOfDays
      if formattedAmounts[currentDate.getTime()]
        lastAmount = parseFloat formattedAmounts[currentDate.getTime()]
      flotReadyAmounts.push [currentDate.getTime(), lastAmount]
      currentDate.setDate(currentDate.getDate() - 1)
      if lastAmount < minAmount
         minAmount = lastAmount
      if lastAmount > maxAmount
        maxAmount = lastAmount
      dayCounter2++

    $("#max-amount").html maxAmount.money()
    $("#min-amount").html minAmount.money()
    minAmount = minAmount - 500
    maxAmount =  maxAmount + 500
    flotReadyAmounts.reverse()
    $('#amount-stats').empty();
    plot = $.plot "#amount-stats", [{ data: flotReadyAmounts}],
      series:
        lines:
          show: true
          lineWidth: 2
        points:
          show: false
      grid:
        hoverable: true
        clickable: true
        borderWidth: 1
        tickColor: $border_color
        borderColor: '#eeeeee'
      colors: [window.rbiColors.blue]
      shadowSize: 0
      yaxis:
        min: minAmount
        max: maxAmount
      xaxis:
        mode: "time"
        minTickSize: [1, "month"]
        monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
      tooltip: true
      tooltipOpts:
        content: '%y.2&euro;<br /> %x'
        xDateFormat: '%d/%m/%y'