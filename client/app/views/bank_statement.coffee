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

    inUse: false

    subViews: []

    subViewLastDate = ''

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
                            view.reload view.model
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

    reload: (account) ->

        view = @
        @model = account

        # render the header - title etc
        @$el.html @templateHeader
            model: account

        # get the operations for this account
        window.collections.operations.reset()
        window.collections.operations.setAccount account
        window.collections.operations.fetch
            success: (operations) ->
                view.addAll()

            error: ->
                console.log "error fetching operations"
        @

    addAll: ->
        # remove the previous ones
        @$("#table-operations").html ""
        @$(".loading").remove()
        for view in @subViews
            view.destroy()
        @subViews = []

        # and render all of them
        for operation in window.collections.operations.models

            # add the operation to the table
            subView = new BalanceOperationView operation, @model
            subViewDate = subView.render().model.get 'date'
            if @subViewLastDate isnt subViewDate
                @subViewLastDate = subViewDate
                @$("#table-operations").append $('<tr class="special"><td colspan="4">' + @subViewLastDate + '</td></tr>')
            @$("#table-operations").append subView.render().el
            @subViews.push subView

        # nicescroll
        # $("#layout-2col-column-right").niceScroll()
        # $("#layout-2col-column-right").getNiceScroll().onResize()

    destroy: ->
        @viewTitle?.destroy()
        for view in @subViews
            view.destroy()
        super()
