BaseView = require '../lib/base_view'

module.exports = class BankSubTitleView extends BaseView

    template: require('./templates/configuration_bank_subtitle')

    constructor: (@model) ->
        super()

    events:
        "change .accountTitle" : 'chooseAccount'

    initialize: ->
        @listenTo @model, 'change', @render
        @listenTo window.activeObjects, 'changeActiveAccount', @checkActive

    chooseAccount: (event) ->
        window.activeObjects.trigger "changeActiveAccount", @model
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
                console.log amounts
                @setupLastYearAmountsFlot(amounts)
            error: ->
                console.log "error fetching amounts of last year"
        @


    setupLastYearAmountsFlot: (amounts) ->
        formattedAmounts = []
        flotReadyAmounts = []
        amounts.each (amount) ->
            # console.log currentDate
            # console.log new Date(amount.get('date'))
            currentDate = new Date()
            currentDate.setHours(0,0,0,0)
            amountDate = new Date(amount.get('date'))
            i = 0
            while amountDate.getTime() isnt currentDate.getTime() and i < 365
                currentDate.setDate(currentDate.getDate() - 1)
                i++
            if i < 364
                formattedAmounts[currentDate.getTime()] = amount.get('amount')

        numberOfDays = 365
        currentDate = new Date()
        currentDate.setHours(0,0,0,0)
        lastAmount = @model.get('amount')
        minAmount = 0
        maxAmount = 0
        i = 0
        while i < numberOfDays
            if formattedAmounts[currentDate.getTime()]
                lastAmount = formattedAmounts[currentDate.getTime()]
            flotReadyAmounts.push [numberOfDays - i, lastAmount]
            currentDate.setDate(currentDate.getDate() - 1)
            if lastAmount < minAmount
                minAmount = lastAmount
            if lastAmount > maxAmount
                maxAmount = lastAmount
            i++
        minAmount = (parseFloat minAmount) - 500
        maxAmount = (parseFloat maxAmount) + 500
        console.log maxAmount + " - " + minAmount
        flotReadyAmounts.reverse()
        plot = $.plot "#social-stats", [{ data: flotReadyAmounts, label: "Solde"}],
            series:
                lines:
                    show: true
                    lineWidth: 1
                points:
                    show: false
            grid:
                hoverable: true
                clickable: true
                borderWidth: 1
                tickColor: $border_color
                borderColor: '#eeeeee'

            colors: ["#f74e4d"]
            shadowSize: 0
            yaxis:
                min: minAmount
                max: maxAmount
            # xaxis:
            #     ticks: [
            #         [1, "janvier"],
            #         [2, "février"],
            #         [3, "mars"],
            #         [4, "avril"],
            #         [5, "mai"],
            #         [6, "juin"],
            #         [7, "juillet"],
            #         [8, "aout"],
            #         [9, "septembre"],
            #         [10, "octobre"],
            #         [11, "novembre"],
            #         [12, "décembre"]
            #     ]


         # $(document).ready(function () {
         #              setupFlots();
         #            });

         #            // Flot charts
         #            function setupFlots() {
         #              var sin = [],
         #                  ammount = [
         #                    [1, 1500],
         #                    [2, 1200],
         #                    [3, 900],
         #                    [4, 2100],
         #                    [5, 1500],
         #                    [6, 1600],
         #                    [7, 1750],
         #                    [8, 2200],
         #                    [9, 2400],
         #                    [10, 2000],
         #                    [11, 1900],
         #                    [12, 1800]
         #                  ];
         #                for (var i = 0; i < 13; i += 0.5) {
         #                  sin.push([i, Math.sin(i)]);
         #                }

         #                var plot = $.plot("#social-stats", [
         #                  { data: ammount, label: "Solde"}
         #                ], {
         #                  series: {
         #                    lines: {
         #                      show: true,
         #                      lineWidth: 1
         #                    },
         #                    points: {
         #                      show: true
         #                    }
         #                  },
         #                  grid:{
         #                    hoverable: true,
         #                    clickable: true,
         #                    borderWidth: 1,
         #                    tickColor: $border_color,
         #                    borderColor: '#eeeeee'
         #                  },
         #                  colors: [$red],
         #                  shadowSize: 0,
         #                  yaxis: {
         #                    min: 500,
         #                    max: 2500
         #                  },
         #                  xaxis: {
         #                    ticks: [
         #                      [1, "janvier"],
         #                      [2, "février"],
         #                      [3, "mars"],
         #                      [4, "avril"],
         #                      [5, "mai"],
         #                      [6, "juin"],
         #                      [7, "juillet"],
         #                      [8, "aout"],
         #                      [9, "septembre"],
         #                      [10, "octobre"],
         #                      [11, "novembre"],
         #                      [12, "décembre"]
         #                    ]
         #                  }



         #                });
         #              }


