BaseView = require '../lib/base_view'
module.exports = class AlertsView extends BaseView

  template: require('./templates/alerts')

  el: 'div#interface-box'

  subViews: []

  initialize: ->

  render: ->
      # lay down the template
      super()
      view = @

      @
