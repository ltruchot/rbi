BaseView = require '../lib/base_view'
Config = require 'models/user_configuration'
ConfigurationBankView = require './configuration_bank'

module.exports = class ConfigurationView extends BaseView

    template: require('./templates/configuration')

    el: '#configuration'
    elAccounts: 'select#account-choice'

    accounts: 0

    subViews: []

    events:
      'change select#account-choice' : 'reloadBudget'
      'keyup #configuration-budget-amount' : 'setBudget'

    reloadBudget: ->
      accountNumber = window.rbiActiveData.accountNumber
      budgetByAccount = window.rbiActiveData.budgetByAccount
      if budgetByAccount[accountNumber]
        $('#account-budget-amount').val budgetByAccount[accountNumber]
        $('#configuration-budget-amount').val budgetByAccount[accountNumber]
      else
        $('#account-budget-amount').val 0
        $('#configuration-budget-amount').val budgetByAccount[accountNumber]

    setBudget: (event) ->
      budgetValue = 0
      jqBudgetInput = $(event.currentTarget)
      budgetValue = jqBudgetInput.val()
      if not /^(\d+(?:[\.\,]\d{2})?)$/.test(budgetValue)
        $('.info-user').css('color', window.rbiColors.red).html 'La valeur du budget semble incomplète ou érronée&nbsp;'
      else
        $('.info-user').css('color', 'inherit').html 'Les modifications sont prises en compte instantanément&nbsp;'
        budgetValue = parseFloat(budgetValue.replace(" ", "").replace(",", "."))
        if isNaN budgetValue
          budgetValue = 0
        if budgetValue > 0
          accountNumber = window.rbiActiveData.accountNumber
          window.rbiActiveData.budgetByAccount[accountNumber] = budgetValue
          window.rbiActiveData.config.save budgetByAccount: window.rbiActiveData.budgetByAccount,
            success:->
              $('#account-budget-amount').val budgetValue
            error: ->
              console.log 'Error: budget configuration not saved'



    afterRender: ->

      #patch chrome and IE for click on select > option
      $(@elAccounts).change ->
        this.options[this.selectedIndex].click()

    initialize: ->
      window.rbiActiveData.config = new Config({})

    render: ->
      # lay down the template
      super()

      #check current configuration
      window.rbiActiveData.config.fetch
        success: (currentConfig) =>

          #prepare chosen account number and budget
          accountNumber = currentConfig.get('accountNumber') or ""
          if accountNumber isnt ""
            window.rbiActiveData.accountNumber = accountNumber
            budgetByAccount = currentConfig.get('budgetByAccount') or {}
            window.rbiActiveData.budgetByAccount = budgetByAccount
            @reloadBudget()

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
            # if accountNumber is ""
            #   $(".accountTitle:eq(0)").click()
      @