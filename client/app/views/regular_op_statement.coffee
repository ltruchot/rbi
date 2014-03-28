BaseView = require '../lib/base_view'
RegularOpStatementEntryView = require "./regular_op_statement_entry"

module.exports = class RegularOpStatementView extends BaseView

  templateHeader: require './templates/regular_op_statement_header'

  events:
    'click a.recheck-button' : "checkAccount"
    'click th.sort-date' : "sortByDate"
    'click th.sort-title' : "sortByTitle"
    'click th.sort-amount' : "sortByAmount"
    'keyup input#search-regular-operations' : "reload"
    'keyup input#search-min-amount' : "reload"
    'keyup input#search-max-amount' : "reload"
    'click .add-regular-operation' : "addToRegularOperation"

  inUse: false

  subViews: []

  subViewLastDate = ''

  params = null

  # INIT
  constructor: (@el) ->
    super()

  # initialize: ->
  #     @listenTo window.activeObjects, 'changeActiveAccount', @reload


  render: ->
    @$el.html require "./templates/regular_op_statement_empty"
      # $("#layout-2col-column-right").niceScroll()
      # $("#layout-2col-column-right").getNiceScroll().onResize()
    @

  getCurrentRules: ->
    rules = null
    if window.rbiActiveData.bankAccount?
      rules =
        accountNumber: window.rbiActiveData.bankAccount.get 'accountNumber'
        pattern: $("input#search-regular-operations").val() or null
        minAmount: $("#search-min-amount").val() or null
        maxAmount: $("#search-max-amount").val() or null
    return rules

  serializeUniquery: (rules) ->
    uniquery = ""
    separator = "(#|#)"
    if rules? and rules.accountNumber?
      uniquery = rules.accountNumber
      if rules.pattern?
        uniquery += separator + rules.pattern
        minAmount = Number(rules.minAmount) or "NEGATIVE_INFINITY"
        maxAmount = Number(rules.maxAmount) or "POSITIVE_INFINITY"
        uniquery += separator + minAmount
        uniquery += separator + maxAmount
    console.log uniquery
    return uniquery

  addToRegularOperation: ->
    console.log "add"
    rules = @getCurrentRules() or null

    #get or set needed data
    if rules?
      @data =
        accounts: [rules.accountNumber]
        searchText: ""
        exactSearchText: rules.pattern.toString()
        dateFrom: null
        dateTo: new Date()
      if rules.maxAmont < rules.minAmont
        @data.amountFrom = rules.maxAmont
        @data.amountTo = rules.minAmont
      else
        @data.amountFrom = rules.minAmont
        @data.amountTo = rules.minAmont

      #standard get operations request
      $.ajax
        type: "POST"
        url: "bankoperations/query"
        data: @data
        success: (objects) =>
          console.log objects
          console.log "get operation linked request sent successfully!"
          if objects? and objects.length > 0
            fixedCostToRegister =
              type: "standard"
              accountNumber: rules.accountNumber
              idTable: []
              uniquery: @serializeUniquery rules

            #add operations to id table
            for object in objects
              fixedCostToRegister.idTable.push object.id

            #save fixed cost and close popup on callback
            @saveFixedCost fixedCostToRegister, =>
              $('#search-regular-operations').keyup()
              window.views.forecastBudgetView.displayRegularOperation rules.accountNumber
          else
           console.log "Operation(s) not found"
        error: (err) ->
          console.log "there was an error"
    else
      console.log "no rules."


  #------------------- BEGIN SERVER COMMUNICATION METHODS ----------------------
  saveFixedCost: (fixedCost, callback) ->
    console.log "save !"

    #post new fixed cost object
    $.ajax
      type: "POST"
      url: "rbifixedcost"
      data: fixedCost

      success: (objects) =>
        console.log "saved !"
        # console.log fixedCosts
        #console.log "fixed cost sent successfully!"

        # #set fixed cost status to model
        # @model.set "fixedCostId", objects.id
        # @model.set "isFixedCost", true

        # #refresh monthly analysis
        # for id in fixedCost.idTable
        #   if window.rbiActiveData.currentOperations[id]?
        #     window.rbiActiveData.currentOperations[id].isFixedCost = true
        #     window.rbiActiveData.currentOperations[id].fixedCostId = fixedCost.id
        # window.views.monthlyAnalysisView.displayMonthlySums window.rbiActiveData.currentOperations

        callback()

      error: (err) ->
        console.log "there was an error"
  #-------------------- END SERVER COMMUNICATION METHODS -----------------------


  checkButtonAddState: ->
    searchInput = $("input#search-regular-operations") or null
    buttonAdd = $(".add-regular-operation") or null
    if buttonAdd? and searchInput? and (buttonAdd.length is 1) and (searchInput.length is 1)
      if searchInput.val() isnt ""
        buttonAdd.attr "disabled", false
      else
        buttonAdd.attr "disabled", true

  reload: (params, callback) ->

    @checkButtonAddState()
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
      if @$("#table-regular-operations").length is 0
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

          if operations
            $.ajax
              type: "GET"
              url: "rbifixedcost"
              success: (fixedCosts) =>
                #console.log "getting fixed cost success."
                window.rbiActiveData.currentOperations = {}
                finalOperations = []
                for operation, index in operations
                  operation.isFixedCost = false
                  if operation.amount < 0
                    for fixedCost in fixedCosts
                      if $.inArray(operation.id, fixedCost.idTable) >= 0
                        operation.isFixedCost = true
                        operation.fixedCostId = fixedCost.id
                        break

                  #adjustement for fixed/variable cost search
                  operationRemoved = false
                  # if (displayFixedCosts and (not operation.isFixedCost))
                  #   operationRemoved = true
                  # else if (displayVariableCosts and (operation.isFixedCost or (operation.amount > 0)))
                  #   operationRemoved = true
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
    jqAmountMin = if ($("#search-min-amount").length is 1) then ($("#search-min-amount").val()).replace(",",".") else null
    jqAmountMax = if ($("#search-max-amount").length is 1) then ($("#search-max-amount").val()).replace(",",".") else null
    amountFromVal = (Number(jqAmountMin) or Number.NEGATIVE_INFINITY)
    amountToVal = (Number(jqAmountMax)  or Number.POSITIVE_INFINITY)
    #if @params?
      # dateFrom = if @params.dateFrom then moment(@params.dateFrom).format 'YYYY-MM-DD' else null
      # dateTo = if @params.dateTo then moment(@params.dateTo).format 'YYYY-MM-DD' else null
    now = new Date()
    dateFrom = moment(moment(now).subtract('y', 1)).format 'YYYY-MM-DD'
    dateTo = moment(now).format 'YYYY-MM-DD'

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
      dateFrom: dateFromVal
      dateTo: dateToVal
      accounts: [accountNumber]
      amountFrom: amountFromVal
      amountTo:   amountToVal



    searchTextVal = $("input#search-regular-operations").val()
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
    @$("#table-regular-operations").html ""
    @$(".loading").remove()
    for view in @subViews
      view.destroy()
      @subViews = []

    #if none return
    if window.collections.operations.models.length is 0
      $("#table-regular-operations").append $('<tr><td>Aucune opération ne correspond à ces critères.</td></tr>')
      return

    # and render all of them
    for operation, index in window.collections.operations.models

      # add the operation to the table
      subView = new RegularOpStatementEntryView operation, @model
      subViewDate = subView.render().model.get 'date'

      #insert day row in table
      if (@subViewLastDate isnt subViewDate) or (index is 0)
        @subViewLastDate = subViewDate
        @$("#table-regular-operations").append $('<tr class="special"><td colspan="4">' + moment(@subViewLastDate).format "DD/MM/YYYY" + '</td></tr>')
        @$("#table-regular-operations").append subView.render().el

  destroy: ->
    @viewTitle?.destroy()
    for view in @subViews
      view.destroy()
      super()
