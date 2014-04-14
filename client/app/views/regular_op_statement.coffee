BaseView = require '../lib/base_view'
RegularOpStatementEntryView = require "./regular_op_statement_entry"

module.exports = class RegularOpStatementView extends BaseView

  templateHeader: require './templates/regular_op_statement_header'

  events:
    # 'click a.recheck-button' : "checkAccount"
    # 'click th.sort-date' : "sortByDate"
    # 'click th.sort-title' : "sortByTitle"
    # 'click th.sort-amount' : "sortByAmount"
    'keyup input#search-regular-operations' : "reload"
    'keyup input#search-min-amount' : "reload"
    'keyup input#search-max-amount' : "reload"
    'click .add-regular-operation' : "addToRegularOperation"
    'click #empty-search-regular-operations' : "emptyAllFields"

  inUse: false

  subViews: []

  subViewLastDate: ''

  params: null

  alreadyRegular: false

  # INIT
  constructor: (@el) ->
    super()

  initialize: ->
      @listenTo window.activeObjects, 'changeActiveAccount', @reload


  render: ->
    @$el.html require "./templates/regular_op_statement_empty"
    @

  emptyAllFields: ->
    $("input#search-regular-operations").val ""
    $("#search-min-amount").val ""
    $("#search-max-amount").val ""
    $("input#search-regular-operations").keyup()

  getCurrentRules: ->
    rules = null
    if window.rbiActiveData.bankAccount?
      rules =
        accountNumber: window.rbiActiveData.bankAccount.get 'accountNumber'
        pattern: $("input#search-regular-operations").val() or null
        minAmount: $("#search-min-amount").val() or null
        maxAmount: $("#search-max-amount").val() or null
      if rules.minAmount?
        rules.minAmount = parseFloat(rules.minAmount).toFixed 2
      if rules.maxAmount?
        rules.maxAmount = parseFloat(rules.maxAmount).toFixed 2
    return rules

  serializeUniquery: (rules) ->
    uniquery = ""
    separator = "(#|#)"
    if rules? and rules.accountNumber?
      uniquery = rules.accountNumber
      if rules.pattern?
        uniquery += separator + rules.pattern
        minAmount = rules.minAmount or "NEGATIVE_INFINITY"
        maxAmount = rules.maxAmount or "POSITIVE_INFINITY"
        uniquery += separator + minAmount.toString()
        uniquery += separator + maxAmount.toString()
    return uniquery

  deserializeUniquery: (uniquery)->
    queryParts = []
    rules = {}

    if uniquery? and ((typeof uniquery) is "string")
      queryParts = uniquery.split("(#|#)")

    rules.accountNumber = queryParts[0] or ""
    rules.pattern = queryParts[1] or ""
    rules.minAmount = if (queryParts[2]? and (queryParts[2] isnt "NEGATIVE_INFINITY")) then parseFloat(queryParts[2]).toFixed(2) else null
    rules.maxAmount = if (queryParts[3]? and (queryParts[3] isnt "POSITIVE_INFINITY")) then parseFloat(queryParts[3]).toFixed(2) else null

    return rules

  addToRegularOperation: (e, settedRules, callback) ->
    rules = settedRules or @getCurrentRules() or null
    if typeof(rules.minAmount) is Number
      rules.minAmount = parseFloat(rules.minAmount).toFixed 2
    if typeof(rules.maxAmount) is Number
      rules.maxAmount = parseFloat(rules.maxAmount).toFixed 2
    #get or set needed data
    if rules?
      data =
        accounts: [rules.accountNumber]
        searchText: rules.pattern.toString()
        exactSearchText: "" #rules.pattern.toString()
        # dateFrom: null
        # dateTo: new Date()
        amountFrom: rules.minAmount
        amountTo: rules.maxAmount
      # if rules.maxAmount > rules.minAmount
      #   data.amountFrom = rules.maxAmount
      #   data.amountTo = rules.minAmount
      # else
      #   data.amountFrom = rules.minAmount
      #   data.amountTo = rules.maxAmount

      #standard get operations request
      $.ajax
        type: "POST"
        url: "bankoperations/query"
        data: data
        success: (objects) =>
          #console.log "get operation linked request sent successfully!"
          if objects? and objects.length > 0
            fixedCostToRegister =
              type: "standard"
              accountNumber: rules.accountNumber
              idTable: []
              uniquery: @serializeUniquery(rules)
              isBudgetPart: true

            #add operations to id table
            for object in objects
              fixedCostToRegister.idTable.push object.id

            #save fixed cost and close popup on callback
            @saveFixedCost fixedCostToRegister, =>
              $('#search-regular-operations').keyup()
              window.views.forecastBudgetView.newRegularOperationsChecked = false
              window.views.forecastBudgetView.displayRegularOperations rules.accountNumber
            if callback?
              callback()
          # else
          #  console.log "Operation(s) not found"
        error: (err) ->
          console.log "there was an error"
    # else
    #   console.log "no rules."


  #------------------- BEGIN SERVER COMMUNICATION METHODS ----------------------
  saveFixedCost: (fixedCost, callback) ->
    #console.log "save !"

    #post new fixed cost object
    $.ajax
      type: "POST"
      url: "rbifixedcost"
      data: fixedCost

      success: (objects) =>

        #refresh monthly analysis
        for id in fixedCost.idTable
          if window.rbiActiveData.currentOperations[id]?
            window.rbiActiveData.currentOperations[id].isRegularOperation = true
            window.rbiActiveData.currentOperations[id].fixedCostId = fixedCost.id
        if callback?
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

  saveMostRecentOperationChecked: (date) ->
    window.rbiActiveData.userConfiguration.save
      mostRecentOperationDate: date or ""


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
        success: (operations) =>
          window.rbiActiveData.userConfiguration.fetch
            success: (currentConfig) =>
              currentRegisteredDate = currentConfig.get("mostRecentOperationDate") or null
              if currentRegisteredDate? and (currentRegisteredDate isnt "")
                @mostRecentOperationDate = moment(currentRegisteredDate)
              else
                @mostRecentOperationDate = null


              if operations?
                $.ajax
                  type: "GET"
                  url: "rbifixedcost"
                  success: (fixedCosts) =>
                    #console.log "getting fixed cost success."
                    window.rbiActiveData.currentOperations = {}
                    finalOperations = []
                    for operation, index in operations
                      operation.isRegularOperation = false
                      for fixedCost in fixedCosts
                        if $.inArray(operation.id, fixedCost.idTable) >= 0
                          operation.isRegularOperation = true
                          operation.fixedCostId = fixedCost.id
                          break

                      #adjustement for fixed/variable cost search
                      # operationRemoved = false
                      # if (displayFixedCosts and (not operation.isRegularOperation))
                      #   operationRemoved = true
                      # else if (displayVariableCosts and (operation.isRegularOperation or (operation.amount > 0)))
                      #   operationRemoved = true
                      #if not operationRemoved
                      finalOperations.push operation
                      window.rbiActiveData.currentOperations[operation.id] = operation

                    if callback?
                      callback window.rbiActiveData.currentOperations
                    window.collections.operations.reset finalOperations
                    window.collections.operations.setComparator "date"
                    window.collections.operations.sort()
                    lastOperation = moment(window.collections.operations.models[0].get "date") or null
                    isRecentOperationEmpty = (not @mostRecentOperationDate?)
                    isRecentOperationOutdated = (moment(@mostRecentOperationDate).format() < moment(lastOperation).format())
                    if lastOperation? and (fixedCosts.length > 0) and (isRecentOperationEmpty or isRecentOperationOutdated)
                      for oldFixedCost, index in fixedCosts
                        @addToRegularOperation null, @deserializeUniquery(oldFixedCost.uniquery)
                      @saveMostRecentOperationChecked moment(lastOperation).format()
                    view.addAll()

                    #display alert about already existing regular operation
                    isSearchFieldEmpty = $("#search-regular-operations").val() is ""
                    if view.alreadyRegular and (not isSearchFieldEmpty)
                      $("#regular-op-light-info").hide()
                      $("#regular-op-exists").show()
                    else
                      $("#regular-op-exists").hide()
                      $("#regular-op-light-info").show()

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
    jqAmountMin = if ($("#search-min-amount").length is 1) then ($("#search-min-amount").val()).replace(",",".") else null
    jqAmountMax = if ($("#search-max-amount").length is 1) then ($("#search-max-amount").val()).replace(",",".") else null
    amountFromVal = (parseFloat(jqAmountMin).toFixed 2) or Number.NEGATIVE_INFINITY
    amountToVal = (parseFloat(jqAmountMax).toFixed 2)  or Number.POSITIVE_INFINITY
    #if @params?
      # dateFrom = if @params.dateFrom then moment(@params.dateFrom).format 'YYYY-MM-DD' else null
      # dateTo = if @params.dateTo then moment(@params.dateTo).format 'YYYY-MM-DD' else null
    now = new Date()
    dateFrom = moment(moment(now).subtract('y', 1)).format 'YYYY-MM-DD'
    dateTo = moment(now).format 'YYYY-MM-DD'

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
    @alreadyRegular = false

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
      subView.render()
      subViewDate = subView.model.get 'date'


      if subView.model.get 'isRegularOperation'
        @alreadyRegular = true

      #insert day row in table
      if (@subViewLastDate isnt subViewDate) or (index is 0)
        @subViewLastDate = subViewDate
        @$("#table-regular-operations").append $('<tr class="special"><td colspan="4">' + moment(@subViewLastDate).format "DD/MM/YYYY" + '</td></tr>')
        @$("#table-regular-operations").append subView.el



  destroy: ->
    @viewTitle?.destroy()
    for view in @subViews
      view.destroy()
      super()
