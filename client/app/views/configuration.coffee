BaseView = require '../lib/base_view'

ConfigurationBankView = require './configuration_bank'

module.exports = class ConfigurationView extends BaseView

    template: require('./templates/configuration')

    el: '#configuration'
    elAccounts: 'ul#account-choice'

    accounts: 0

    subViews: []

    initialize: ->
        @listenTo window.activeObjects, "new_access_added_successfully", @noMoreEmpty

    noMoreEmpty: ->
        # @$(".arrow")?.hide()
        # @$(".loading")?.hide()

        window.collections.banks.fetch
            success: =>
                @render()

    render: ->
        # lay down the template
        super()

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
            $(".accountTitle:eq(0)").click()

            # $("#layout-2col-column-left").niceScroll()
            # $("#layout-2col-column-left").getNiceScroll().onResize()

            # no accounts
            #if @accounts == 0
                #$(view.elAccounts).prepend require "./templates/balance_banks_empty"

        @


    empty: ->
        @operationsView?.destroy()
        for view in @subViews
            view.destroy()
