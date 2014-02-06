BaseView = require '../lib/base_view'

module.exports = class BankSubTitleView extends BaseView

    template: require('./templates/configuration_bank_subtitle')

    constructor: (@model) ->
        super()

    events:
        "change .accountTitle" : 'chooseAccount'

    formattedAmounts: []

    initialize: ->
        @listenTo @model, 'change', @render
        @listenTo window.activeObjects, 'changeActiveAccount', @checkActive

    chooseAccount: (event) ->
        window.activeObjects.trigger "changeActiveAccount", @model
        window.rbiActiveData.bankAccount = @model
        window.views.monthlyAnalysisView.render()
        console.log 'amount = ' + @model.get 'amount'
        today = @formatDate(new Date())
        $("#current-amount-date").text today
        $("#account-amount-balance").text $(event.currentTarget).parent().children('input.accountAmount').val()
        @loadLastYearAmounts(@model)

    checkActive: (account) ->
        @$(".row").removeClass("active")
        if account == @model
            @$(".row").addClass("active")

    loadLastYearAmounts: (account) ->

        window.collections.amounts.reset()
        window.collections.amounts.setAccount account
        window.collections.amounts.fetch
            success: (amounts) =>
                @setupLastYearAmountsFlot amounts
                $(window).resize =>
                    @setupLastYearAmountsFlot amounts
            error: ->
                console.log "error fetching amounts of last year"
        @

    formatDate: (date) ->
        day = ('0' + date.getDate()).slice -2
        month = ('0' + (date.getMonth() + 1)).slice -2
        year = date.getFullYear()
        return (day + '/' + month + '/' + year)

    setupLastYearAmountsFlot: (amounts) ->
        flotReadyAmounts = []
        daysPerMonth =
            twelve : 365
            six : 365 / 2
            three : 365 / 4
        numberOfDays = daysPerMonth.three
        threeMonthAgo = new Date()
        threeMonthAgo = threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3)
        sixMonthAgo = new Date()
        sixMonthAgo = sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
        dayRatio = 4
        amounts.each (amount) =>
            currentDate = new Date()
            currentDate.setHours 12,0,0,0
            amountDate = new Date(amount.get 'date')

            i = 0
            while amountDate.getTime() isnt currentDate.getTime() and i < 365
                currentDate.setDate(currentDate.getDate() - 1)
                i++
            if i < 364
                @formattedAmounts[currentDate.getTime()] = amount.get 'amount'
            if currentDate.getTime() < threeMonthAgo
                numberOfDays = daysPerMonth.six
            else if currentDate.getTime() < sixMonthAgo
                numberOfDays = daysPerMonth.twelve

        currentDate = new Date()
        currentDate.setHours 12,0,0,0
        lastAmount = parseFloat @model.get('amount')
        minAmount = parseFloat @model.get('amount')
        maxAmount = parseFloat @model.get('amount')
        i = 0

        while i < numberOfDays
            if @formattedAmounts[currentDate.getTime()]
                lastAmount = parseFloat @formattedAmounts[currentDate.getTime()]
            flotReadyAmounts.push [currentDate.getTime(), lastAmount]
            currentDate.setDate(currentDate.getDate() - 1)
            if lastAmount < minAmount
                minAmount = lastAmount
            if lastAmount > maxAmount
                maxAmount = lastAmount
            i++
            # console.log '--------------'
            # console.log 'last = ' + lastAmount
            # console.log 'max = ' + maxAmount
            # console.log 'min = ' + minAmount
            # console.log '--------------'
        $("#max-amount").text (maxAmount + ' €')
        $("#min-amount").text (minAmount + ' €')
        minAmount = minAmount - 500
        maxAmount =  maxAmount + 500

        flotReadyAmounts.reverse()
        plot = $.plot "#amount-stats", [{ data: flotReadyAmounts, label: "Solde"}],
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
                content: '%y.2  &euro;<br /> %x'
                xDateFormat: '%d/%m/%y'