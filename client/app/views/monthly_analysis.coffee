BaseView = require '../lib/base_view'
module.exports = class MonthlyAnalysisView extends BaseView

    template: require('./templates/monthly_analysis')

    el: 'div#content'

    subViews: []

    initialize: ->

    render: ->
        # lay down the template
        super()
        view = @

        @
