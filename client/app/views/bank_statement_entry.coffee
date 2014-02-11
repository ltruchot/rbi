BaseView = require '../lib/base_view'

module.exports = class EntryView extends BaseView

  template: require './templates/entry_element'

  tagName: 'tr'

  events:
    'mouseenter td > .variable-cost' : 'switchFixedCostIcon'
    'mouseleave td > .variable-cost' : 'switchFixedCostIcon'
    'click td > .variable-cost' : 'popupFixedCost'
    'click #cancel-fixed-cost' : 'destroyPopupFixedCost'
    'click #save-fixed-cost' : 'prepareFixedCost'

  destroyPopupFixedCost: (event) ->
    jqPopup = $(event.currentTarget).parent()
    jqParent = jqPopup.parent()
    jqFixedCostIcon = jqPopup.children('.variable-cost')
    jqFixedCostIcon.appendTo jqParent
    jqPopup.remove()
    if $(event.currentTarget).hasClass 'cancel-fixed-cost'
      jqFixedCostIcon.mouseleave()
    else
      jqFixedCostIcon.removeClass('variable-cost').addClass 'fixed-cost'

  prepareFixedCost: (event) ->
    jqPopup = $(event.currentTarget).parent()
    userChoice = jqPopup.children('input[type=radio]:checked').val()
    accountNumber = window.rbiActiveData.bankAccount.get 'accountNumber'
    neededRequest = false
    fixedCostToRegister =
      type: userChoice
    switch userChoice
      when 'standard'
        @data =
          accounts: [accountNumber]
          searchText: @operationTitle
          dateFrom: null
          dateTo: new Date()
        if @operationMax < @operationMin
          @data.amountFrom = @operationMax
          @data.amountTo = @operationMin
        else
          @data.amountFrom = @operationMin
          @data.amountTo = @operationMax
        fixedCostToRegister.query = @data
        fixedCostToRegister.idTable = []
        neededRequest = true
      when 'onetime'
        fixedCostToRegister.query = {}
        fixedCostToRegister.idTable = [@model.get 'id']


    if neededRequest
      $.ajax
        type: "POST"
        url: "bankoperations/query"
        data: @data
        success: (objects) =>
          console.log "sent successfully!"
          if objects? and objects.length > 0
            for object in objects
              fixedCostToRegister.idTable.push object.id
            @saveFixedCost fixedCostToRegister, =>
              @destroyPopupFixedCost event
          else
            console.log "Operation(s) not found"
        error: (err) ->
          console.log "there was an error"
    else
      @saveFixedCost fixedCostToRegister, =>
        @destroyPopupFixedCost event


  saveFixedCost: (fixedCost, callback) ->
    console.log fixedCost
    callback()


  switchFixedCostIcon: (event) ->
    jqFixedCostIcon = $(event.currentTarget)
    if (jqFixedCostIcon.attr 'data-icon') is ''
      jqFixedCostIcon.attr 'data-icon', ''
    else
      jqFixedCostIcon.attr 'data-icon', ''

  popupFixedCost: (event) ->
    jqFixedCostIcon = $(event.currentTarget)
    if (jqFixedCostIcon.attr 'data-icon') is ''
      jqFixedCostIcon.attr 'data-icon', ''
    jqIconParent = jqFixedCostIcon.parent()
    jqPopup = $('<div class="popup-fixed-cost"></div>')
    jqFixedCostIcon.appendTo jqPopup
    jqPopup.append '<span class="fixed-cost-title">Ajouter aux frais fixes</span>'

    #preparation de la règle
    currency = window.rbiActiveData.currency.entity
    @operationTitle = (@model.get 'title')
    @operationMax = (parseFloat (@model.get 'amount') * 1.1)
    @operationMin = (parseFloat (@model.get 'amount') * 0.9)
    jqPopup.append '<button type="button" id="save-fixed-cost" class="btn btn-xs btn-primary">Valider</button>'
    jqPopup.append '<button type="button" id="cancel-fixed-cost" class="btn btn-xs btn-danger" >Annuler</button>'
    jqPopup.append '<input type="radio" name="fixed-cost-option" value="standard" checked="true" /> <label>Toutes les opérations intitulées "' + @operationTitle + '" d\'un montant entre  ' + @operationMin.money() + currency + ' et ' + @operationMax.money() + currency + '</label><br />'
    jqPopup.append '<input type="radio" name="fixed-cost-option" value="onetime" /> <label>Seulement cette opération</label><br />'
    jqPopup.append '<input type="radio" name="fixed-cost-option" valur="custom" /> <label>Définir une règle</label>'
    jqPopup.appendTo jqIconParent


  constructor: (@model, @account, @showAccountNum = false) ->
    super()

  render: ->
    if @model.get("amount") > 0
      @$el.addClass "success"
    @model.account = @account
    @model.formattedDate = moment(@model.get('date')).format "DD/MM/YYYY" #moment(@model.get('date')).format "DD/MM/YYYY"

    if @showAccountNum
      hint = "#{@model.account.get('title')}, " + \
             "n°#{@model.account.get('accountNumber')}"
      @model.hint = "#{@model.account.get('title')}, " + \
                    "n°#{@model.account.get('accountNumber')}"
    else
      @model.hint = "#{@model.get('raw')}"
    super()
    @