BaseView = require '../lib/base_view'
module.exports = class ComparedAnalysisView extends BaseView

  template: require('./templates/compared_analysis')

  el: 'div#interface-box'

  subViews: []

  initialize: ->

  render: ->
      # lay down the template
      super()
      view = @

      @
