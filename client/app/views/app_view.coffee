BaseView = require '../lib/base_view'

# NavbarView = require 'views/navbar'
# NewBankView = require 'views/new_bank'

# AccountsView = require 'views/accounts'
# BalanceView = require 'views/balance'
# SearchView = require 'views/search'


module.exports = class AppView extends BaseView

    template: require('./templates/app')

    el: '#content'

    afterRender: ->
        console.log 'afterrender'

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
                                    for account in col.models
                                        console.log account.get 'title'
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


