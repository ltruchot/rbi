BaseView = require '../lib/base_view'

#AccountsView = require 'views/accounts'
ConfigurationView = require 'views/configuration'
MonthlyAnalysisView = require 'views/monthly_analysis'
ComparedAnalysisView = require 'views/compared_analysis'
OnlineShoppingView = require 'views/online_shopping'
AlertsView = require 'views/alerts'
MenuView = require 'views/menu'


module.exports = class AppView extends BaseView

  template: require('./templates/app')

  el: 'body.application'

  afterRender: ->


    # init - get the necessary data
    window.collections.banks.fetch
      data:
        withAccountOnly: true
      success: ->
        if not @menuView
          @menuView =  new MenuView()
        if not window.views.configurationView
          window.views.configurationView = new ConfigurationView()
        if not window.views.monthlyAnalysisView
          window.views.monthlyAnalysisView = new MonthlyAnalysisView()
        if not window.views.comparedAnalysisView
          window.views.comparedAnalysisView = new ComparedAnalysisView()
        if not window.views.onlineShoppingView
          window.views.onlineShoppingView = new OnlineShoppingView()
        if not window.views.alertsView
          window.views.alertsView =  new AlertsView()

        # if not window.views.accountsView
        #     window.views.accountsView = new AccountsView()

        @menuView.render()
        window.views.configurationView.render()


        # start routing
        Backbone.history.start()
      error: ->

        # could not get banks, or 0 banks available - fatal error
        console.log "Fatal error: could not get the banks list"
        #alert window.i18n "fatal_error"

    #index events (should be in app template)
    $('#account-budget-icon').click ->
      $('#account-budget-amount').focus()


