BaseView = require '../lib/base_view'
BalanceOperationView = require "./bank_statement_entry"

module.exports = class BankStatementView extends BaseView

    templateHeader: require './templates/bank_statement_header'

    events:
        'click a.recheck-button' : "checkAccount"
        'keyup input#search-text' : "reload"
        'click .special' : "reloadMap"

    inUse: false

    subViews: []

    subViewLastDate: ''

    params: null

    mapLinked: false

    enhancedLinked: false

    # INIT
    constructor: (@el) ->
        super()

    initialize: ->
        @listenTo window.activeObjects, 'changeActiveAccount', @reload

    render: ->
        @$el.html require "./templates/bank_statement_empty"
        @


    reload: (params, callback) ->

        view = @

        #client or server search ?
        # isClientSearch = false
        # if params.clientSearch
        #     isClientSearch = true


        @model = window.rbiActiveData.bankAccount

        #server search
        if params? and params.dateFrom?
            @params = params
        if @model?
            @updateFilters()
            if @$("#table-operations").length is 0
                @$el.html @templateHeader
                    model: @model

        displayFixedCosts = if @data? then (@data.fixedCosts or false) else false
        displayVariableCosts = if @data? then (@data.variableCosts or false) else false

        if @send
            $.ajax
                type: "POST"
                url: "bankoperations/byDate"
                data: @data
                success: (operations) =>
                    if operations
                        $.ajax
                            type: "GET"
                            url: "rbifixedcost"
                            success: (fixedCosts) =>
                                window.rbiActiveData.currentOperations = {}
                                finalOperations = []
                                for operation, index in operations

                                    if @enhancedLinked
                                        allReceipts = window.views.enhancedReportView.allReceipts
                                        operation.hasReceipt = false
                                        for model in allReceipts.models
                                            id = model.get "id"
                                            amount = Math.abs(model.get "amount")
                                            date = moment(model.get "timestamp")
                                            minDate = moment(moment(operation.date).subtract("days", 3))
                                            maxDate = moment(moment(operation.date).add("days", 3))
                                            if (Math.abs(operation.amount) is amount) and (minDate < date) and (maxDate > date)
                                                operation.hasReceipt = true
                                                operation.receiptModel = model
                                                break

                                        if operation.hasReceipt
                                            finalOperations.push operation
                                            window.rbiActiveData.currentOperations[operation.id] = operation

                                    else if (@mapLinked isnt true) and (@enhancedLinked isnt true)
                                        operation.isRegularOperation = false
                                        if operation.amount < 0
                                            for fixedCost in fixedCosts
                                                if $.inArray(operation.id, fixedCost.idTable) >= 0
                                                    operation.isRegularOperation = true
                                                    operation.fixedCostId = fixedCost.id
                                                    break

                                        #adjustement for fixed/variable cost search
                                        operationRemoved = false
                                        if displayFixedCosts and (not operation.isRegularOperation)
                                            operationRemoved = true
                                        else if displayVariableCosts and (operation.isRegularOperation or (operation.amount > 0))
                                            operationRemoved = true
                                        if not operationRemoved
                                            finalOperations.push operation
                                            window.rbiActiveData.currentOperations[operation.id] = operation
                                    else
                                        finalOperations.push operation
                                        window.rbiActiveData.currentOperations[operation.id] = operation

                                if callback?
                                    callback window.rbiActiveData.currentOperations
                                window.collections.operations.reset finalOperations
                                window.collections.operations.setComparator "date"
                                window.collections.operations.sort()
                                view.addAll()
                            error: (err) ->
                                console.log "getting fixed cost failed."

                    else
                        window.collections.operations.reset()

                error: (err) ->
                    console.log "there was an error"
                    if callback?
                        callback null


    updateFilters: ->


        # get elements
        if @params?
            dateFrom = if @params.dateFrom then moment(@params.dateFrom).format 'YYYY-MM-DD' else null
            dateTo = if @params.dateTo then moment(@params.dateTo).format 'YYYY-MM-DD' else null

         # check that there are things to send
        unless dateFrom or dateTo

           @send = false
           window.collections.operations.reset()
           return
        else
           @send = true

        if window.rbiActiveData.bankAccount?
            accountNumber = window.rbiActiveData.bankAccount.get 'accountNumber'
        else
            @send = false

        # get values
        dateFromVal = new Date(dateFrom or null)
        dateToVal = new Date(dateTo or new Date())

        # store the results
        @data = null
        @data =
            dateFrom:   dateFromVal
            dateTo:     dateToVal
            accounts:   [accountNumber]

        if @enhancedLinked
            @data.searchText = "intermarché"
        else if @mapLinked
            @data.searchText = $("input#search-text").val()
        else
            searchTextVal = $("input#search-text").val()
            if searchTextVal? and (searchTextVal isnt "")
                if searchTextVal is "#credits"
                    @data.credits = true
                else if searchTextVal is "#debits"
                    @data.debits = true
                else if searchTextVal is "#frais-fixes"
                    @data.fixedCosts = true
                else if searchTextVal is "#depenses"
                    @data.variableCosts = true
                else
                    @data.searchText = searchTextVal

    addAll: ->

        # remove the previous ones
        @$("#table-operations").html ""
        @$(".loading").remove()
        for view in @subViews
            view.destroy()
        @subViews = []

        #if none return
        if (window.collections.operations.models.length is 0) and (not @enhancedLinked)
            $("#table-operations").append $('<tr><td>Aucune opération ne correspond à ces critères.</td></tr>')
            return
        else if (window.collections.operations.models.length is 0) and @enhancedLinked
            $("#table-operations").append $('<tr><td>Aucune opération ne semble liée à un ticket intermarché.</td></tr>')
            return

        # and render all of them
        for operation, index in window.collections.operations.models

            # add the operation to the table
            subView = new BalanceOperationView operation, @model, false, @mapLinked, @enhancedLinked
            subViewDate = subView.render().model.get 'date'

            #insert day row in table
            if (@subViewLastDate isnt subViewDate) or (index is 0)
                @subViewLastDate = subViewDate
                @$("#table-operations").append $('<tr class="special"><td colspan="4">' + moment(@subViewLastDate).format "DD/MM/YYYY" + '</td></tr>')
            @$("#table-operations").append subView.render().el
        if @enhancedLinked and $(".operation-title:eq(0)").length is 1
            $(".operation-title:eq(0)").click()


    reloadMap: (event) ->
        if @mapLinked
            date = moment($(event.currentTarget).children("td").text(), "DD/MM/YYYY").format "YYYY-MM-DD"
            window.views.geolocatedReportView.switchDay null, new Date(date)
    destroy: ->
        @viewTitle?.destroy()
        for view in @subViews
            view.destroy()
        super()
