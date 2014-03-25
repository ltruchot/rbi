BaseView = require '../lib/base_view'

module.exports = class BankSubTitleView extends BaseView

    tagName: 'tr'

    template: require('./templates/configuration_bank_account')

    constructor: (@model) ->
        super()

    events:
        'click .btn-courant' : 'chooseAccount'
        'click .btn-epargne' : 'setDepositAccount'
        'click .btn-off' : 'setOffAccount'

    # formattedAmounts: []


    initialize: ->
        # @listenTo @model, 'change', @render
        @listenTo window.activeObjects, 'changeActiveAccount', @checkActive


    afterRender: ->
        currentAccountNumber = @model.get("accountNumber")
        depositList = window.rbiActiveData.userConfiguration.get("depositList") or []
        for deposit in depositList
            if deposit is currentAccountNumber
                jqBtnDeposit = @$el.find ".btn-epargne"
                jqBtnOff = @$el.find ".btn-off"
                jqBtnDeposit.removeClass("btn-default").addClass "btn-warning"
                jqBtnOff.removeClass("btn-danger").addClass "btn-default"

        accountNumber = window.rbiActiveData.accountNumber
        if (accountNumber isnt "") and (accountNumber is currentAccountNumber)
            @chooseAccount()

    setDepositAccount: (event) ->
        if event?
            jqBtnDeposit = $(event.currentTarget)
            if jqBtnDeposit.hasClass "btn-default"
                otherButtons = (jqBtnDeposit.closest "tr").find ".btn"
                otherButtons.removeClass("btn-info btn-danger").addClass "btn-default"
                jqBtnDeposit.removeClass("btn-default").addClass "btn-warning"
        @saveConfiguration()


    setOffAccount: (event) ->
        if event?
            jqBtnOff = $(event.currentTarget)
            if jqBtnOff.hasClass "btn-default"
                otherButtons = (jqBtnOff.closest "tr").find ".btn"
                otherButtons.removeClass("btn-info btn-warning").addClass "btn-default"
                jqBtnOff.removeClass("btn-default").addClass "btn-danger"
        @saveConfiguration()

    saveConfiguration: ->
        depositAccountList = []
        $('.btn-epargne').each ->
            if $(@).hasClass "btn-warning"
                depositAccountList.push $(@).attr("id")
        window.rbiActiveData.userConfiguration.save
            depositList: depositAccountList
            error: ->
                console.log 'Error: configuration not saved'


    chooseAccount: (event) ->
        $(".btn-courant").each ->
            if $(@).hasClass "btn-info"
                $(@).removeClass("btn-info").addClass "btn-default"
                btnOff = ($(@).closest "tr").find ".btn-off"
                btnOff.removeClass("btn-default").addClass "btn-danger"

        #set input to checked state
        #@$el.attr('selected', 'true')
        thatBtnCourant = @$el.find ".btn-courant"
        thatBtnCourant.removeClass("btn-default").addClass "btn-info"
        thatOtherButtons = @$el.find ".btn"
        thatOtherButtons.removeClass("btn-warning btn-danger").addClass "btn-default"



        #trigger "changeActiveAccount" to fire @listenTo linked
        window.activeObjects.trigger "changeActiveAccount", @model

        #save configuration
        window.rbiActiveData.userConfiguration.save
            accountNumber: @model.get "accountNumber"
            error: ->
                console.log 'Error: configuration not saved'
        window.rbiActiveData.accountNumber = @model.get 'accountNumber'

        #save bank account
        window.rbiActiveData.bankAccount = @model

        #set date & amount to widgets
        today = @formatDate(new Date())
        $("#current-amount-date").text today
        $("#account-amount-balance").html (@model.get 'amount').money()

        #load calculated amounts to set up the flot chart and render montly analysis view
        # window.rbiDataManager.loadLastYearAmounts @model, ->
        #     if window.views.appView.isLoading
        #         window.views.monthlyAnalysisView.render()
        #         window.views.appView.displayInterfaceView()
        @loadLastYearAmounts @model, ->
            if window.views.appView.isLoading
                window.views.monthlyAnalysisView.render()
                window.views.appView.displayInterfaceView()
                window.app.router.navigate 'analyse-mensuelle'
                #window.views.monthlyAnalysisView.render()


    checkActive: (account) ->
        @$(".row").removeClass("active")
        if account == @model
            @$(".row").addClass("active")

    loadLastYearAmounts: (account, callback) ->
        view = @
        window.collections.amounts.reset()
        window.collections.amounts.setAccount account
        window.collections.amounts.fetch
            success: (amounts) ->
                view.setupLastYearAmountsFlot amounts
                $(window).resize () ->
                    view.setupLastYearAmountsFlot amounts
                if callback? then callback()
            error: ->
                console.log "error fetching amounts of last year"

    formatDate: (date) ->
        day = ('0' + date.getDate()).slice -2
        month = ('0' + (date.getMonth() + 1)).slice -2
        year = date.getFullYear()
        return (day + '/' + month + '/' + year)

    setupLastYearAmountsFlot: (amounts) ->
        view = @
        @formattedAmounts = []
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
                view.formattedAmounts[currentDate1.getTime()] = amount.get 'amount'
            if currentDate1.getTime() < threeMonthAgo
                numberOfDays = daysPerMonth.six
            else if currentDate1.getTime() < sixMonthAgo
                numberOfDays = daysPerMonth.twelve


        currentDate = new Date()
        currentDate.setHours 12,0,0,0
        lastAmount = parseFloat @model.get('amount')
        minAmount = parseFloat @model.get('amount')
        maxAmount = parseFloat @model.get('amount')

        dayCounter2 = 0
        while dayCounter2 < numberOfDays
            if @formattedAmounts[currentDate.getTime()]
                lastAmount = parseFloat @formattedAmounts[currentDate.getTime()]
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