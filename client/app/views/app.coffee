BaseView = require '../lib/base_view'
MenuView = require 'views/menu'
MonthlyAnalysisView = require 'views/monthly_analysis'
ForecastBudgetView = require 'views/forecast_budget'
# ComparedAnalysisView = require 'views/compared_analysis'
# OnlineShoppingView = require 'views/online_shopping'
# AlertsView = require 'views/alerts'
EnhancedReportView = require 'views/enhanced_report'
GeolocatedReportView = require 'views/geolocated_report'
ConfigurationView = require 'views/configuration'



module.exports = class AppView extends BaseView

  template: require('./templates/app')

  el: 'body.application'

  isLoading: true

  afterRender: ->


    # init - get the necessary data
    window.collections.banks.fetch
      data:
        withAccountOnly: true
      success: =>
        if not @menuView
          @menuView =  new MenuView()
        if not window.views.monthlyAnalysisView
          window.views.monthlyAnalysisView = new MonthlyAnalysisView()
        if not window.views.forecastBudgetView
          window.views.forecastBudgetView = new ForecastBudgetView()
        # if not window.views.comparedAnalysisView
        #   window.views.comparedAnalysisView = new ComparedAnalysisView()
        # if not window.views.onlineShoppingView
        #   window.views.onlineShoppingView = new OnlineShoppingView()
        # if not window.views.alertsView
        #   window.views.alertsView =  new AlertsView()
        if not window.views.enhancedReportView
          window.views.enhancedReportView = new EnhancedReportView()
        if not window.views.geolocatedReportView
          window.views.geolocatedReportView = new GeolocatedReportView()
        if not window.views.configurationView
          window.views.configurationView = new ConfigurationView()


        @menuView.render()

        # #load configuration
        # config = window.rbiActiveData.userConfiguration or null
        # if config? and config.accountNumber? and (config.accountNumber isnt "")
        #   window.views.monthlyAnalysisView.render()
        # else
        #window.views.configurationView.render()


        # start routing
        Backbone.history.start()

        #loading during configuration
        @displayLoadingView()
        #configuration is a necessary step, routing to monthly analysis if minimal parameters are OK
        if document.location.hash isnt "#" + "parametres"
          window.app.router.navigate 'parametres', {trigger: true}

      error: ->

        # could not get banks, or 0 banks available - fatal error
        console.log "Fatal error: could not get the banks list"
        #alert window.i18n "fatal_error"

    #index events (should be in app template)
    # $('#account-budget-icon').click ->
    #   $('#account-budget-amount').focus()

  displayLoadingView: ->
    @isLoading = true
    $('#two-cols-box').hide()
    $('#fullsize-box').show()
    loaderHtml = '<div class="config-loader">' +
      "\t" + 'Chargement de vos paramètres...<br /><br />' +
      "\t" + '<img src="./loader_big_blue.gif" />' +
      '</div>'
    $('#fullsize-box').append loaderHtml

  displayInterfaceView: ->
    $('#fullsize-box').empty().hide()
    $('#two-cols-box').show()
    @isLoading = false



