AppView = require 'views/app'

BanksCollection = require 'collections/banks'
BankOperationsCollection = require 'collections/bank_operations'
BankAmountsCollection = require 'collections/bank_amounts'

module.exports =

    initialize: ->

        # $.ajax('cozy-locale.json')
        #     .done( (data) => @locale = data.locale )
        #     .fail(     () => @locale = 'en'        )
        #     .always(   () => @step2()    )
        @step2()

    step2: ->

        # internationalisation
        # @polyglot = new Polyglot()
        # window.polyglot =  @polyglot
        # try
        #     locales = require "locales/#{@locale}"
        # catch e
        #     locales = require 'locales/en'

        # @polyglot.extend locales
        # window.t = @polyglot.t.bind @polyglot
        # window.i18n = (key) -> window.polyglot.t key

        # collections, views
        window.collections = {}
        window.views = {}

        # banks, operations
        window.collections.allBanks = new BanksCollection()
        window.collections.banks = new BanksCollection()
        window.collections.operations = new BankOperationsCollection()
        window.collections.amounts = new BankAmountsCollection()
        window.rbiColors =
            border_color : "#efefef"
            grid_color : "#ddd"
            default_black : "#666"
            green : "#8ecf67"
            yellow : "#fac567"
            orange : "#F08C56"
            blue : "#87ceeb"
            red : "#f74e4d"
            teal : "#28D8CA"
            grey : "#999999"


        ###
                views
        ###
        # this one is tricky - it lays down the structure, so it needs to be rendered
        # before any other view using that structure
        window.views.appView = new AppView()
        window.views.appView.render()

        window.activeObjects = {}
        _.extend(window.activeObjects, Backbone.Events);
        window.rbiActiveData = {}
        window.rbiActiveData.currency =
            name : 'euro'
            entity : '&euro;'

        # Routing management
        Router = require 'router'
        @router = new Router()
        #Backbone.history.start()

        # Makes this object immuable.
        Object.freeze this if typeof Object.freeze is 'function'