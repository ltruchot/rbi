BaseView = require '../lib/base_view'
BankOperationsCollection = require "../collections/bank_operations"
BalanceOperationView = require "./bank_statement_entry"

module.exports = class BankStatementView extends BaseView

    templateHeader: require './templates/bank_statement_header'

    events:
        'click a.recheck-button' : "checkAccount"
        'click th.sort-date' : "sortByDate"
        'click th.sort-title' : "sortByTitle"
        'click th.sort-amount' : "sortByAmount"
        'keyup input#search-text' : "reload"

    inUse: false

    subViews: []

    subViewLastDate = ''

    params = null

    # INIT
    constructor: (@el) ->
        super()

    setIntervalWithContext: (code,delay,context) ->
        setInterval(() ->
            code.call(context)
        ,delay)

    initialize: ->
        @listenTo window.activeObjects, 'changeActiveAccount', @reload
        @listenTo window.collections.operations, 'sort', @addAll
        @setIntervalWithContext @updateTimer, 1000, @
        window.collections.operations.setComparator "date"


    # SORTING
    sortByDate: (event) ->
        @sortBy "date"

    sortByTitle: (event) ->
        @sortBy "title"

    sortByAmount: (event) ->
        @sortBy "amount"

    sortBy: (order) ->

        operations = window.collections.operations

        # check if we're just reversing order
        operations.toggleSort order

        # apply styles
        @$("th.sorting_asc").removeClass "sorting_asc"
        @$("th.sorting_desc").removeClass "sorting_desc"
        @$("th.sort-#{order}").addClass "sorting_#{operations.order}"

        # change comparator & sort
        operations.setComparator order
        operations.sort()


    checkAccount: (event) ->

        event.preventDefault()
        button = $ event.target
        view = @

        if not @inUse
            console.log "Checking account ..."
            view.inUse = true
            button.html "checking..."
            $.ajax
                url: url = "bankaccounts/retrieveOperations/" + @model.get("id")
                type: "GET"
                success: ->

                    #update it's url
                    view.model?.url = "bankaccounts/" + view.model?.get("id")

                    # update the model
                    view.model?.fetch
                        success: () ->
                            console.log "... checked"
                            button.html "checked"
                            view.inUse = false
                            view.reload()
                        error: () ->
                            console.log "... there was an error fetching"
                            button.html "error..."
                            view.inUse = false
                error: (err) ->
                    console.log "... there was an error checking"
                    console.log err
                    button.html "error..."
                    view.inUse = false

    updateTimer: () ->
        if @model?
            model = @model
            #@$("span.last-checked").html "#{window.i18n("balance_last_checked")} #{moment(moment(model.get("lastChecked"))).fromNow()}. "


    render: ->
        @$el.html require "./templates/bank_statement_empty"
        # $("#layout-2col-column-right").niceScroll()
        # $("#layout-2col-column-right").getNiceScroll().onResize()
        @

    reload: (params, callback) ->
        view = @
        @model = window.rbiActiveData.bankAccount
        if params? and params.dateFrom?
            @params = params
        if @model?
            @updateFilters()
            if @$("#table-operations").length is 0
                @$el.html @templateHeader
                    model: @model

        if @send
            $.ajax
                type: "POST"
                url: "bankoperations/byDate"
                data: @data
                success: (operations) ->
                    console.log "sent successfully!"
                    # console.log objects
                    if operations
                        $.ajax
                            type: "GET"
                            url: "rbifixedcost"
                            success: (fixedCosts) ->
                                console.log "getting fixed cost success."
                                window.rbiCurrentOperations = {}
                                for operation in operations
                                    operation.isFixedCost = false
                                    if operation.amount < 0
                                        for fixedCost in fixedCosts
                                            if $.inArray(operation.id, fixedCost.idTable) >= 0
                                                operation.isFixedCost = true
                                                operation.fixedCostId = fixedCost.id
                                                break
                                    window.rbiCurrentOperations[operation.id] = operation
                                if callback?
                                    callback window.rbiCurrentOperations
                                window.collections.operations.reset operations
                                view.addAll()
                            error: (err) ->
                                console.log "getting fixed cost failed."
                    else
                        window.collections.operations.reset()

                error: (err) ->
                    console.log "there was an error"
                    if callback?
                        callback null




        # # render the header - title etc
        # @$el.html @templateHeader
        #     model: account

        # # get the operations for this account
        # window.collections.operations.reset()
        # window.collections.operations.setAccount account
        # window.collections.operations.fetch
        #     success: (operations) ->
        #         view.addAll()

        #     error: ->
        #         console.log "error fetching operations"
        # @

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
           console.log "Empty query"
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

        searchTextVal = $("input#search-text").val()
        if searchTextVal? and (searchTextVal isnt "")
            if searchTextVal is "#credits"
                @data.credits = true
            else if searchTextVal is "#debits"
                @data.debits = true
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
        if window.collections.operations.models.length is 0
            $("#table-operations").append $('<tr><td>Aucune opération ne correspond à ces critères.</td></tr>')
            return

        # and render all of them
        for operation in window.collections.operations.models

            # add the operation to the table
            subView = new BalanceOperationView operation, @model
            subViewDate = subView.render().model.get 'date'
            if @subViewLastDate isnt subViewDate
                @subViewLastDate = subViewDate
                @$("#table-operations").append $('<tr class="special"><td colspan="4">' + moment(@subViewLastDate).format "DD/MM/YYYY" + '</td></tr>')
            @$("#table-operations").append subView.render().el

    destroy: ->
        @viewTitle?.destroy()
        for view in @subViews
            view.destroy()
        super()
