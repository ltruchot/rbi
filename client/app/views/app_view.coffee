BaseView = require '../lib/base_view'

# NavbarView = require 'views/navbar'
# NewBankView = require 'views/new_bank'

# AccountsView = require 'views/accounts'
# BalanceView = require 'views/balance'
# SearchView = require 'views/search'


module.exports = class AppView extends BaseView

    template: require('./templates/app')

    el: '#content'
    currentAccountId : 1
    accountCount : 0

    afterRender: ->
        console.log 'afterrender'
        thisAppView = @
        $('#account-budget-amount').on 'keyup', ->
            $("#budget" + thisAppView.currentAccountId).val parseInt($(@).val())

        # init - get the necessary data
        window.collections.banks.fetch
            data:
                withAccountOnly: true
            success: ->
                window.collections.allBanks.fetch
                    success: ->

                        console.log 'all bank ok'
                        # prepare the banks list
                        view = @

                        treatment = (bank, callback) ->
                            # get bank accounts
                            bank.accounts.fetch
                                success: (col, data) ->
                                    bankName = bank.get('name')
                                    $('#content').append('<div id="parameters" class="parameters"></div>')
                                    $('#parameters').append '<h2>' + bankName + '</h2>'
                                    accountList = $('<ul></ul>')
                                    for account in col.models
                                        thisAppView.accountCount++
                                        accountListItem = $('<li></li>')
                                        accountTitle = account.get 'title'
                                        accountAmount = account.get 'amount'
                                        accountListItem.append '<input type="radio" id="account' + thisAppView.accountCount + '" name="accountTitle" class="accountTitle" />' + '<label for="accountTitle">' + accountTitle + '</label>'
                                        accountListItem.append ' - Solde : <input type="text" class="accountAmount" value="' + accountAmount + '" disabled="true" />'
                                        accountListItem.append ' - Budget : <input type="text" id="budget' + thisAppView.accountCount + '" class="accountBudget" value="0" /><br />'
                                        accountList.append accountListItem
                                    $('#parameters').append accountList
                                    $('.accountTitle').on 'change', ->
                                        thisAppView.currentAccountId = parseInt($(@).attr('id').replace('account', ''))
                                        $('#account-budget-amount').removeClass()
                                        $('#account-budget-amount').addClass 'current' + thisAppView.currentAccountId
                                        $("#account-amount-balance").text $(@).parent().children('input.accountAmount').val()
                                        $("#account-budget-amount").val $(@).parent().children('input.accountBudget').val()
                                    $('.accountBudget').on 'keyup', ->
                                        if $("#account-budget-amount").hasClass 'current' + parseInt($(@).attr('id').replace('budget', ''))
                                            $("#account-budget-amount").val parseInt($(@).val())
                                    $('.accountTitle:eq(0)').click()
                                    # return the number of accounts
                                #     callback null, col.length
                                #     viewBank.render() if col.length > 0
                                # error: (col, err, opts) ->
                                #     callback null, col.length
                                    # viewBank.$el.html ""

                        # render all banks
                        console.log window.collections.banks.models
                        async.concat window.collections.banks.models, treatment, (err, results) ->

                            if err
                                console.log err
                                alert window.i18n "error_loading_accounts"

                            # @accounts = results.length

                            # $("#layout-2col-column-left").niceScroll()
                            # $("#layout-2col-column-left").getNiceScroll().onResize()

                            # # no accounts
                            # if @accounts == 0
                            #     $(view.elAccounts).prepend require "./templates/balance_banks_empty"


                        # @navbarView.render()
                        # @newbankView.render()

                        # start routing
                        Backbone.history.start()
                    error: ->

                        # could not get banks, or 0 banks available - fatal error
                        console.log "Fatal error: could not get the banks list"
                        alert window.i18n "fatal_error"


