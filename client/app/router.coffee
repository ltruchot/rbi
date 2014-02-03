AppView = require 'views/app'

module.exports = class Router extends Backbone.Router

  routes:
    '': 'monthly_analysis'
    'analyse-mensuelle' : 'monthly_analysis'
    'analyse-mensuelle-comparee' : 'compared_analysis'
    'achats-en-ligne' : 'online_shopping'
    'alertes' : 'alerts'


  monthly_analysis: ->
    window.views.monthlyAnalysisView?.render()

  compared_analysis: ->
    window.views.comparedAnalysisView?.render()

  online_shopping: ->
    window.views.onlineShoppingView?.render()

  alerts: ->
    window.views.alertsView?.render()