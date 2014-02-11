BaseView = require '../lib/base_view'

module.exports = class EntryView extends BaseView

  template: require './templates/entry_element'

  tagName: 'tr'

  events:
    'mouseenter .fixed-cost' : 'switchFixedCostIcon'
    'mouseleave .fixed-cost' : 'switchFixedCostIcon'

  switchFixedCostIcon: (event) ->
    jqFixedCostIcon = $(event.currentTarget)
    if (jqFixedCostIcon.attr 'data-icon') is ''
      jqFixedCostIcon.attr 'data-icon', ''
    else
      jqFixedCostIcon.attr 'data-icon', ''

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