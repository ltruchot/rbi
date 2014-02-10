BaseView = require '../lib/base_view'
Config = require 'models/user_configuration'
ConfigurationBankView = require './configuration_bank'

module.exports = class ConfigurationView extends BaseView

    template: require('./templates/configuration')

    el: '#configuration'
    elAccounts: 'ul#account-choice'

    accounts: 0

    subViews: []

    initialize: ->
      @listenTo window.activeObjects, "new_access_added_successfully", @noMoreEmpty
      window.rbiActiveData.config = new Config({})

    noMoreEmpty: ->
      window.collections.banks.fetch
        success: =>
          @render()

    render: ->
      # lay down the template
      super()

      #check current configuration
      window.rbiActiveData.config.fetch
        success: (currentConfig) =>

          #prepare chosen account number
          accountNumber = currentConfig.get 'accountNumber' || ""
          if accountNumber isnt ""
            window.rbiActiveData.accountNumber = accountNumber

          # prepare the banks list
          view = @

          treatment = (bank, callback) ->
            viewBank = new ConfigurationBankView bank
            view.subViews.push viewBank
            # load loading placeholder
            $(view.elAccounts).append viewBank.el
            # get bank accounts
            bank.accounts.fetch
              success: (col) ->
                # return the number of accounts
                callback null, col.length
                viewBank.render() if col.length > 0
              error: (col, err, opts) ->
                callback null, col.length
                viewBank.$el.html ""

          # render all banks
          async.concat window.collections.banks.models, treatment, (err, results) ->

            if err
              console.log err
              alert window.i18n "error_loading_accounts"

            @accounts = results.length

            #no accounts
            if @accounts == 0
              $(view.elAccounts).prepend require "./templates/balance_banks_empty"

            #no account number
            if accountNumber is ""
              $(".accountTitle:eq(0)").click()
      @


    empty: ->
      @operationsView?.destroy()
      for view in @subViews
        view.destroy()
