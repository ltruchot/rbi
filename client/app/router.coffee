AppView = require 'views/app'

module.exports = class Router extends Backbone.Router

  routes:
    '': 'monthly_analysis'
    'analyse-mensuelle' : 'monthly_analysis'
    'budget-previsionnel' : 'forecast_budget'
    # 'analyse-mensuelle-comparee' : 'compared_analysis'
    # 'achats-en-ligne' : 'online_shopping'
    # 'alertes' : 'alerts'
    'releve-augmente' : 'enhanced_report'
    'releve-geolocalise' : 'geolocated_report'
    'parametres' : 'configuration'

  monthly_analysis: ->
    window.views.monthlyAnalysisView?.render()

  forecast_budget: ->
    window.views.forecastBudgetView?.render()

  # compared_analysis: ->
  #   window.views.comparedAnalysisView?.render()

  # online_shopping: ->
  #   window.views.onlineShoppingView?.render()

  # alerts: ->
  #   window.views.alertsView?.render()

  enhanced_report: ->
    window.views.enhancedReportView?.render()

  geolocated_report: ->
    window.views.geolocatedReportView?.render()

  configuration: ->
    window.views.configurationView?.render()