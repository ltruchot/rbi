BaseView = require '../lib/base_view'
module.exports = class EnhancedReportView extends BaseView

  template: require('./templates/enhanced_report')

  el: 'div#interface-box'

  subViews: []

  initialize: ->

  render: ->

      # lay down the template
      super()
      view = @

      @
