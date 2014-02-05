BaseView = require '../lib/base_view'
BankStatementView = require "./bank_statement"
module.exports = class MonthlyAnalysisView extends BaseView

  template: require('./templates/monthly_analysis')

  el: 'div#interface-box'

  subViews: []

  initialize: ->

  render: ->
    console.log 'render statement'
    # lay down the template
    super()
    view = @

    @bankStatementView = new BankStatementView $('#context-box')
    @bankStatementView.render()
    console.log @bankStatementView


    @
