BaseView = require '../lib/base_view'
module.exports = class ForecastBudgetEntryView extends BaseView

  template: require './templates/forecast_budget_entry'

  tagName: 'tr'

  events:
    "click .toogle-monthly-budget" : "toogleMonthlyBudget"
    "click .remove-regular-operation" : "removeRegularOperation"
    "click td:eq(0),td:eq(1)" : "modifyRegularOperation"
    'mouseenter td:eq(0), td:eq(1) ' : "showHighlighting"
    'mouseleave td:eq(0), td:eq(1) ' : "hideHighlighting"

  rules: {}

#     #mouse interaction with cost type icon
#     'mouseenter .popup-container > .variable-cost' : 'switchFixedCostIcon'
#     'mouseleave .popup-container > .variable-cost' : 'switchFixedCostIcon'
#     'mouseenter .popup-container > .fixed-cost' : 'switchFixedCostIcon'
#     'mouseleave .popup-container > .fixed-cost' : 'switchFixedCostIcon'
#     'click .popup-container > .variable-cost' : 'popupFixedCost'
#     'click .popup-container > .fixed-cost' : 'popupFixedCost'

#     #mouse interaction with popup buttons
#     'click #cancel-fixed-cost' : 'destroyPopupFixedCost'
#     'click #save-fixed-cost' : 'prepareFixedCost'
#     'click #remove-fixed-cost' : 'removeFixedCost'


  #--------------------------- BEGIN BACKBONE METHODS --------------------------
  constructor: (@model) ->
    super()

  render: ->

    if @model.get("uniquery")?
      @rules = @deserializeUniquery @model.get("uniquery")
      @addAverageToRules()
      @model.set "rules", @rules
    super()
    @
  #---------------------------- END BACKBONE METHODS ---------------------------


  #---------------------------- BEGIN EVENTS METHODS ---------------------------
  toogleMonthlyBudget: (event) ->
    isBudgetPart = $(event.currentTarget).is ":checked"
    #post new fixed cost object
    $.ajax
      type: "PUT"
      url: "rbifixedcost/" + @model.get "id"
      data:
        isBudgetPart: isBudgetPart

      success: (objects) =>
        window.views.forecastBudgetView.displayRegularOperations()
        console.log "saved !"
      error: (err) ->
        console.log "There was an error during saving regular operation process"

  showHighlighting: (event) ->
    jqTr = $(event.currentTarget).closest "tr"
    jqTr.addClass "highlighted-rule"

  hideHighlighting: (event) ->
    jqTr = $(event.currentTarget).closest "tr"
    jqTr.removeClass "highlighted-rule"

  modifyRegularOperation: (currentEvent) ->
    $("#search-regular-operations").val @rules.queryPattern
    $("#search-min-amount").val @rules.queryMin
    $("#search-max-amount").val @rules.queryMax
    $("#search-regular-operations").keyup()

  deserializeUniquery: (uniquery)->
    queryParts = []
    rules = {}

    if uniquery? and ((typeof uniquery) is "string")
      queryParts = uniquery.split("(#|#)")

    rules.queryAccountNumber = queryParts[0] or ""
    rules.queryPattern = queryParts[1] or ""
    rules.queryMin = if (queryParts[2]? and (queryParts[2] isnt "NEGATIVE_INFINITY")) then Number(queryParts[2]) else null
    rules.queryMax = if (queryParts[3]? and (queryParts[3] isnt "POSITIVE_INFINITY")) then Number(queryParts[3]) else null

    return rules

  addAverageToRules: ->
    idTable = @model.get "idTable"
    allOperationsById = window.rbiActiveData.allOperationsById
    mid = 0
    count = 0
    addedAmounts = 0
    if idTable? and allOperationsById? and idTable.length > 0
      for id in idTable
        if allOperationsById[id]?
          addedAmounts += allOperationsById[id].amount
          count++
    if addedAmounts isnt 0
      mid = addedAmounts / count
    @rules.queryMid = mid
    @rules.textQueryMid = mid.money()



    # @rules.textQueryMin = if @rules.queryMin? then @rules.queryMin.money() else ""
    # @rules.textQueryMax = if @rules.queryMax? then @rules.queryMax.money() else ""
    # @rules.textQueryMid = ""
    # min = @rules.queryMin
    # max = @rules.queryMax
    # if min? and max?
    #   mid = parseFloat(min) + parseFloat(max)
    #   @rules.textQueryMid = (mid / 2).money()
    # else if min?
    #   @rules.textQueryMid = "> à " + min.money()
    # else if max?
    #   @rules.textQueryMid = "< à " + max.money()


  removeRegularOperation: (event) ->
    regularOperationId = (@model.get "id") or null
    if regularOperationId?
      $.ajax
          url: '/rbifixedcost/' + regularOperationId
          type: 'DELETE'
          success: (result) =>
            window.views.forecastBudgetView.displayRegularOperations()
            $('#search-regular-operations').keyup()

          error: ->
            console.log "Delete fixed cost failed."

#   destroyPopupFixedCost: (event) ->

#     #get caller & popup
#     jqCaller = $(event.currentTarget)
#     jqPopup = jqCaller.parent()

#     #return icon to cell
#     jqParent = jqPopup.parent()
#     jqFixedCostIcon = jqPopup.children('.iconCostType')
#     jqFixedCostIcon.appendTo jqParent

#     #remove the popop
#     jqPopup.remove()

#     #cancel or apply
#     if jqCaller.attr('id') is 'cancel-fixed-cost'
#       jqFixedCostIcon.mouseleave()
#     else

#       #switch icons
#       if jqFixedCostIcon.hasClass 'variable-cost'
#         jqFixedCostIcon.removeClass('variable-cost').addClass 'fixed-cost'
#       else
#         jqFixedCostIcon.removeClass('fixed-cost').addClass 'variable-cost'

#   removeFixedCost: (event) ->
#     fixedCostId = @model.get "fixedCostId" or null
#     if fixedCostId?
#       $.ajax
#           url: '/rbifixedcost/' + fixedCostId
#           type: 'DELETE'
#           success: (result) =>
#             console.log "Delete fixed cost success."
#             @destroyPopupFixedCost event
#             $('#search-text').keyup()

#             #refresh monthly analysis
#             if window.rbiActiveData.currentOperations?
#               for id, operation of window.rbiActiveData.currentOperations
#                 if operation.fixedCostId? and (operation.fixedCostId = fixedCostId)
#                   operation.isRegularOperation = false
#                   operation.fixedCostId = null
#               window.views.monthlyAnalysisView.displayMonthlySums window.rbiActiveData.currentOperations
#           error: ->
#             console.log "Delete fixed cost failed."


#   prepareFixedCost: (event) ->

#     #get popup
#     jqPopup = $(event.currentTarget).parent()

#     #get or set needed data
#     userChoice = jqPopup.children('input[type=radio]:checked').val()
#     accountNumber = window.rbiActiveData.bankAccount.get 'accountNumber'
#     neededRequest = false
#     fixedCostToRegister =
#       type: userChoice
#       accountNumber: accountNumber
#       idTable: []

#     #apply userchoice
#     switch userChoice

#       #prepare standard query to get linked operations
#       when 'standard'
#         @data =
#           accounts: [accountNumber]
#           searchText: ""
#           exactSearchText: @operationTitle
#           dateFrom: null
#           dateTo: new Date()
#         if @operationMax < @operationMin
#           @data.amountFrom = @operationMax
#           @data.amountTo = @operationMin
#         else
#           @data.amountFrom = @operationMin
#           @data.amountTo = @operationMax

#         #prepare uniquery
#         currentUniquery = accountNumber + '(#|#)' + @operationTitle
#         currentUniquery += '(#|#)' + @data.amountFrom + '(#|#)' + @data.amountTo
#         fixedCostToRegister.uniquery =  currentUniquery
#         neededRequest = true

#       #directly set operation
#       when 'onetime'
#         fixedCostToRegister.uniquery = ""
#         fixedCostToRegister.idTable.push(@model.get 'id')

#       #prepare custom query to get linked operations
#       when 'custom'
#         console.log 'custom not ready '

#     #standard and custom get operations request
#     if neededRequest
#       $.ajax
#         type: "POST"
#         url: "bankoperations/query"
#         data: @data
#         success: (objects) =>
#           #console.log "get operation linked request sent successfully!"
#           if objects? and objects.length > 0

#             #add operations to id table
#             for object in objects
#               fixedCostToRegister.idTable.push object.id

#             #save fixed cost and close popup on callback
#             @saveFixedCost fixedCostToRegister, =>
#               @destroyPopupFixedCost event
#               $('#search-text').keyup()
#           else
#             console.log "Operation(s) not found"
#         error: (err) ->
#           console.log "there was an error"
#     else

#       #save fixed cost and close popup on callback
#       @saveFixedCost fixedCostToRegister, =>
#         @destroyPopupFixedCost event
#         $('#search-text').keyup()



#   switchFixedCostIcon: (event) ->
#     jqFixedCostIcon = $(event.currentTarget)
#     if (jqFixedCostIcon.attr 'data-icon') is ''
#       jqFixedCostIcon.attr 'data-icon', ''
#     else
#       jqFixedCostIcon.attr 'data-icon', ''

#   popupFixedCost: (event) ->

#     #prepare needed data
#     jqFixedCostIcon = $(event.currentTarget)
#     jqIconParent = jqFixedCostIcon.parent()
#     newFixedCost = jqFixedCostIcon.hasClass 'variable-cost'
#     popupTitle = "Ajouter aux frais fixes"
#     idValidationBtn = "save-fixed-cost"

#     #keep icon
#     if newFixedCost
#       jqFixedCostIcon.attr 'data-icon', ''
#     else
#       jqFixedCostIcon.attr 'data-icon', ''
#       popupTitle = "Retirer des frais fixes"
#       idValidationBtn = "remove-fixed-cost"

#     #create popup and inject icon
#     jqPopup = $('<div class="popup-fixed-cost"></div>')
#     jqFixedCostIcon.appendTo jqPopup
#     jqPopup.append '<span class="fixed-cost-title">' + popupTitle + '</span>'
#     jqPopup.append '<button type="button" id="' + idValidationBtn + '" class="btn btn-xs btn-primary">Valider</button>'
#     jqPopup.append '<button type="button" id="cancel-fixed-cost" class="btn btn-xs btn-danger" >Annuler</button>'

#     #prepare the rules for new fixed cost
#     @operationTitle = (@model.get 'title')
#     if newFixedCost
#       @operationMax = (parseFloat (@model.get 'amount') * 1.1)
#       @operationMin = (parseFloat (@model.get 'amount') * 0.9)
#       jqPopup.append '<input type="radio" name="fixed-cost-option" value="standard" checked="true" /> <label>Toutes les opérations intitulées "' + @operationTitle + '" d\'un montant entre  ' + @operationMin.money() + ' et ' + @operationMax.money() + '</label><br />'
#       jqPopup.append '<input type="radio" name="fixed-cost-option" value="onetime" /> <label>Seulement cette opération</label><br />'
#       # jqPopup.append '<input type="radio" name="fixed-cost-option" valur="custom" disabled="true" /> <label>Définir une règle</label>'
#     else
#       jqPopup.append '<p>Cette action enlevera l\'opération des frais fixes, ainsi que <strong>les autres opérations précédemment associées</strong>.</p>'

#     #inject popup
#     jqPopup.appendTo jqIconParent

  #----------------------------- END EVENTS METHODS ----------------------------


#   #------------------- BEGIN SERVER COMMUNICATION METHODS ----------------------
#   saveFixedCost: (fixedCost, callback) ->

#     #post new fixed cost object
#     $.ajax
#         type: "POST"
#         url: "rbifixedcost"
#         data: fixedCost

#         success: (objects) =>
#           #console.log "fixed cost sent successfully!"

#           #set fixed cost status to model
#           @model.set "fixedCostId", objects.id
#           @model.set "isRegularOperation", true

#           #refresh monthly analysis
#           for id in fixedCost.idTable
#             if window.rbiActiveData.currentOperations[id]?
#               window.rbiActiveData.currentOperations[id].isRegularOperation = true
#               window.rbiActiveData.currentOperations[id].fixedCostId = fixedCost.id
#           window.views.monthlyAnalysisView.displayMonthlySums window.rbiActiveData.currentOperations

#           callback()

#         error: (err) ->
#           console.log "there was an error"
#   #-------------------- END SERVER COMMUNICATION METHODS -----------------------
