BaseView = require '../lib/base_view'

module.exports = class RegularOpStatementEntryView extends BaseView

  template: require './templates/regular_op_statement_entry'

  tagName: 'tr'

  events:
    'click' : 'applySearch'


  #--------------------------- BEGIN BACKBONE METHODS --------------------------
  constructor: (@model, @account, @showAccountNum = false) ->
    super()

  render: ->
    if @model.get("amount") > 0
      @$el.addClass "success"
    @model.account = @account
    @model.formattedDate = moment(@model.get('date')).format "DD/MM/YYYY"

    if (@model.get 'amount') > 0
      @model.costClass = 'not-displayed-cost'
    else
      @model.costClass = "variable-cost"
      @model.costIcon = "&#57482;"
      if @model.get 'isFixedCost'
        @model.costClass = "fixed-cost"
        @model.costIcon = "&#57481;"

    if @showAccountNum
      hint = "#{@model.account.get('title')}, " + \
             "n°#{@model.account.get('accountNumber')}"
      @model.hint = "#{@model.account.get('title')}, " + \
                    "n°#{@model.account.get('accountNumber')}"
    else
      @model.hint = "#{@model.get('raw')}"

    super()
    @
  #---------------------------- END BACKBONE METHODS ---------------------------


  #---------------------------- BEGIN EVENTS METHODS ---------------------------
  applySearch: ->
    console.log @model
    currentAmount = parseFloat(@model.get("amount") or 0)
    modifier = Math.abs parseFloat(currentAmount * 0.1)
    title = (@model.get('title') or "").toString()
    minAmount = (currentAmount - modifier).toFixed(2)
    maxAmount = (currentAmount + modifier).toFixed(2)
    $("input#search-regular-operations").val title
    if minAmount isnt 0 then $("#search-min-amount").val minAmount
    if maxAmount isnt 0 then $("#search-max-amount").val maxAmount
    $("input#search-regular-operations").keyup()

  destroyPopupFixedCost: (event) ->

    #get caller & popup
    jqCaller = $(event.currentTarget)
    jqPopup = jqCaller.parent()

    #return icon to cell
    jqParent = jqPopup.parent()
    jqFixedCostIcon = jqPopup.children('.iconCostType')
    jqFixedCostIcon.appendTo jqParent

    #remove the popop
    jqPopup.remove()

    #cancel or apply
    if jqCaller.attr('id') is 'cancel-fixed-cost'
      jqFixedCostIcon.mouseleave()
    else

      #switch icons
      if jqFixedCostIcon.hasClass 'variable-cost'
        jqFixedCostIcon.removeClass('variable-cost').addClass 'fixed-cost'
      else
        jqFixedCostIcon.removeClass('fixed-cost').addClass 'variable-cost'

  removeFixedCost: (event) ->
    fixedCostId = @model.get "fixedCostId" or null
    if fixedCostId?
      $.ajax
          url: '/rbifixedcost/' + fixedCostId
          type: 'DELETE'
          success: (result) =>
            console.log "Delete fixed cost success."
            @destroyPopupFixedCost event
            $('#search-text').keyup()

            #refresh monthly analysis
            if window.rbiActiveData.currentOperations?
              for id, operation of window.rbiActiveData.currentOperations
                if operation.fixedCostId? and (operation.fixedCostId = fixedCostId)
                  operation.isFixedCost = false
                  operation.fixedCostId = null
              window.views.monthlyAnalysisView.displayMonthlySums window.rbiActiveData.currentOperations
          error: ->
            console.log "Delete fixed cost failed."


  prepareFixedCost: (event) ->

    #get popup
    jqPopup = $(event.currentTarget).parent()

    #get or set needed data
    userChoice = jqPopup.children('input[type=radio]:checked').val()
    accountNumber = window.rbiActiveData.bankAccount.get 'accountNumber'
    neededRequest = false
    fixedCostToRegister =
      type: userChoice
      accountNumber: accountNumber
      idTable: []

    #apply userchoice
    switch userChoice

      #prepare standard query to get linked operations
      when 'standard'
        @data =
          accounts: [accountNumber]
          searchText: ""
          exactSearchText: @operationTitle
          dateFrom: null
          dateTo: new Date()
        if @operationMax < @operationMin
          @data.amountFrom = @operationMax
          @data.amountTo = @operationMin
        else
          @data.amountFrom = @operationMin
          @data.amountTo = @operationMax

        #prepare uniquery
        currentUniquery = accountNumber + '(#|#)' + @operationTitle
        currentUniquery += '(#|#)' + @data.amountFrom + '(#|#)' + @data.amountTo
        fixedCostToRegister.uniquery =  currentUniquery
        neededRequest = true

      #directly set operation
      when 'onetime'
        fixedCostToRegister.uniquery = ""
        fixedCostToRegister.idTable.push(@model.get 'id')

      #prepare custom query to get linked operations
      when 'custom'
        console.log 'custom not ready '

    #standard and custom get operations request
    if neededRequest
      $.ajax
        type: "POST"
        url: "bankoperations/query"
        data: @data
        success: (objects) =>
          #console.log "get operation linked request sent successfully!"
          if objects? and objects.length > 0

            #add operations to id table
            for object in objects
              fixedCostToRegister.idTable.push object.id

            #save fixed cost and close popup on callback
            @saveFixedCost fixedCostToRegister, =>
              @destroyPopupFixedCost event
              $('#search-text').keyup()
          else
            console.log "Operation(s) not found"
        error: (err) ->
          console.log "there was an error"
    else

      #save fixed cost and close popup on callback
      @saveFixedCost fixedCostToRegister, =>
        @destroyPopupFixedCost event
        $('#search-text').keyup()



  switchFixedCostIcon: (event) ->
    jqFixedCostIcon = $(event.currentTarget)
    if (jqFixedCostIcon.attr 'data-icon') is ''
      jqFixedCostIcon.attr 'data-icon', ''
    else
      jqFixedCostIcon.attr 'data-icon', ''

  popupFixedCost: (event) ->

    #prepare needed data
    jqFixedCostIcon = $(event.currentTarget)
    jqIconParent = jqFixedCostIcon.parent()
    newFixedCost = jqFixedCostIcon.hasClass 'variable-cost'
    popupTitle = "Ajouter aux frais fixes"
    idValidationBtn = "save-fixed-cost"

    #keep icon
    if newFixedCost
      jqFixedCostIcon.attr 'data-icon', ''
    else
      jqFixedCostIcon.attr 'data-icon', ''
      popupTitle = "Retirer des frais fixes"
      idValidationBtn = "remove-fixed-cost"

    #create popup and inject icon
    jqPopup = $('<div class="popup-fixed-cost"></div>')
    jqFixedCostIcon.appendTo jqPopup
    jqPopup.append '<span class="fixed-cost-title">' + popupTitle + '</span>'
    jqPopup.append '<button type="button" id="' + idValidationBtn + '" class="btn btn-xs btn-primary">Valider</button>'
    jqPopup.append '<button type="button" id="cancel-fixed-cost" class="btn btn-xs btn-danger" >Annuler</button>'

    #prepare the rules for new fixed cost
    @operationTitle = (@model.get 'title')
    if newFixedCost
      @operationMax = (parseFloat (@model.get 'amount') * 1.1)
      @operationMin = (parseFloat (@model.get 'amount') * 0.9)
      jqPopup.append '<input type="radio" name="fixed-cost-option" value="standard" checked="true" /> <label>Toutes les opérations intitulées "' + @operationTitle + '" d\'un montant entre  ' + @operationMin.money() + ' et ' + @operationMax.money() + '</label><br />'
      jqPopup.append '<input type="radio" name="fixed-cost-option" value="onetime" /> <label>Seulement cette opération</label><br />'
      # jqPopup.append '<input type="radio" name="fixed-cost-option" valur="custom" disabled="true" /> <label>Définir une règle</label>'
    else
      jqPopup.append '<p>Cette action enlevera l\'opération des frais fixes, ainsi que <strong>les autres opérations précédemment associées</strong>.</p>'

    #inject popup
    jqPopup.appendTo jqIconParent

  #----------------------------- END EVENTS METHODS ----------------------------


  #------------------- BEGIN SERVER COMMUNICATION METHODS ----------------------
  saveFixedCost: (fixedCost, callback) ->

    #post new fixed cost object
    $.ajax
        type: "POST"
        url: "rbifixedcost"
        data: fixedCost

        success: (objects) =>
          #console.log "fixed cost sent successfully!"

          #set fixed cost status to model
          @model.set "fixedCostId", objects.id
          @model.set "isFixedCost", true

          #refresh monthly analysis
          for id in fixedCost.idTable
            if window.rbiActiveData.currentOperations[id]?
              window.rbiActiveData.currentOperations[id].isFixedCost = true
              window.rbiActiveData.currentOperations[id].fixedCostId = fixedCost.id
          window.views.monthlyAnalysisView.displayMonthlySums window.rbiActiveData.currentOperations

          callback()

        error: (err) ->
          console.log "there was an error"
  #-------------------- END SERVER COMMUNICATION METHODS -----------------------
