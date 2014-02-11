BaseView = require '../lib/base_view'

module.exports = class EntryView extends BaseView

  template: require './templates/entry_element'

  tagName: 'tr'

  events:
    'mouseenter td > .fixed-cost' : 'switchFixedCostIcon'
    'mouseleave td > .fixed-cost' : 'switchFixedCostIcon'
    'click td > .fixed-cost' : 'popupFixedCost'
    'click #cancel-fixed-cost' : 'destroyPopupFixedCost'

  destroyPopupFixedCost: (event) ->
    jqPopup = $(event.currentTarget).parent()
    jqParent = jqPopup.parent()
    jqFixedCostIcon = jqPopup.children('.fixed-cost')
    jqFixedCostIcon.appendTo jqParent
    jqPopup.remove()
    jqFixedCostIcon.mouseleave()


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
    operationTitle = (@model.get 'title')
    operationMax = (parseFloat (@model.get 'amount') * 1.1).money() + currency
    operationMin = (parseFloat (@model.get 'amount') * 0.9).money() + currency
    jqPopup.append '<button type="button" id="save-fixed-cost" class="btn btn-xs btn-primary">Valider</button>'
    jqPopup.append '<button type="button" id="cancel-fixed-cost" class="btn btn-xs btn-danger" >Annuler</button>'
    jqPopup.append '<input type="radio" name="fixed-cost-option" checked="true" /> <label>Toutes les opérations intitulées "' + operationTitle + '" d\'un montant entre  ' + operationMin + ' et ' + operationMax + '</label><br />'
    jqPopup.append '<input type="radio" name="fixed-cost-option" /> <label>Seulement cette opération</label><br />'
    jqPopup.append '<input type="radio" name="fixed-cost-option" /> <label>Définir une règle</label>'
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