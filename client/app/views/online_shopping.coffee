BaseView = require '../lib/base_view'
module.exports = class OnlineShoppingView extends BaseView

  template: require('./templates/online_shopping')

  el: 'div#interface-box'

  subViews: []

  initialize: ->

  render: ->
      # lay down the template
      super()
      view = @

      @
