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
                success: (operations) ->
                    #console.log "sent successfully!"
                    # console.log objects
                    if operations
                        $.ajax
                            type: "GET"
                            url: "rbifixedcost"
                            success: (fixedCosts) =>
                                #console.log "getting fixed cost success."
                                window.rbiActiveData.currentOperations = {}
                                finalOperations = []
                                for operation, index in operations
                                    operation.isRegularOperation = false
                                    if operation.amount < 0
                                        for fixedCost in fixedCosts
                                            if $.inArray(operation.id, fixedCost.idTable) >= 0
                                                operation.isRegularOperation = true
                                                operation.fixedCostId = fixedCost.id
                                                break

                                    #adjustement for fixed/variable cost search
                                    operationRemoved = false
                                    # if (displayFixedCosts and (not operation.isRegularOperation))
                                    #     operationRemoved = true
                                    # else if (displayVariableCosts and (operation.isRegularOperation or (operation.amount > 0)))
                                    #     operationRemoved = true
                                    if not operationRemoved
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
        # console.log '----------------------'
        # console.log 'update filter params :'
        # console.log @params
        # get elements
        if @params?
            dateFrom = if @params.dateFrom then moment(@params.dateFrom).format 'YYYY-MM-DD' else null
            dateTo = if @params.dateTo then moment(@params.dateTo).format 'YYYY-MM-DD' else null

         # check that there are things to send
        unless dateFrom or dateTo
           #console.log "Empty query"
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
        @data =
            dateFrom:   dateFromVal
            dateTo:     dateToVal
            accounts:   [accountNumber]

        if @enhancedLinked
            @data.searchText = "intermarché"
        else if @mapLinked
            @data.searchText = ""
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
        console.log "addAll"
        # remove the previous ones
        @$("#table-operations").html ""
        @$(".loading").remove()
        for view in @subViews
            view.destroy()
        @subViews = []

        #if none return
        if window.collections.operations.models.length is 0
            $("#table-operations").append $('<tr><td>Aucune opération ne correspond à ces critères.</td></tr>')
            return

        # and render all of them
        for operation, index in window.collections.operations.models

            # add the operation to the table
            subView = new BalanceOperationView operation, @model, false, @mapLinked
            subViewDate = subView.render().model.get 'date'

            #insert day row in table
            if (@subViewLastDate isnt subViewDate) or (index is 0)
                @subViewLastDate = subViewDate
                @$("#table-operations").append $('<tr class="special"><td colspan="4">' + moment(@subViewLastDate).format "DD/MM/YYYY" + '</td></tr>')
            @$("#table-operations").append subView.render().el


    reloadMap: (event) ->
        if @mapLinked
            date = moment($(event.currentTarget).children("td").text(), "DD/MM/YYYY").format "YYYY-MM-DD"
            console.log date
            window.views.geolocatedReportView.switchDay null, new Date(date)
    destroy: ->
        @viewTitle?.destroy()
        for view in @subViews
            view.destroy()
        super()
