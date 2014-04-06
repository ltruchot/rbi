AppView = require 'views/app'

BanksCollection = require 'collections/banks'
BankOperationsCollection = require 'collections/bank_operations'
BankAmountsCollection = require 'collections/bank_amounts'
RegularOperationsCollection = require 'collections/regular_operations'
UserConfiguration = require 'models/user_configuration'
DataManager = require 'lib/data_manager'

module.exports =

    initialize: ->

        # set globals app, collections, data
        window.app = @
        window.collections = {}
        window.views = {}
        window.rbiActiveData = {}


        #set global active data
        window.rbiActiveData.userConfiguration = new UserConfiguration({})
        window.rbiActiveData.olderOperationDate = moment(new Date())
        window.rbiActiveData.budgetByAccount = {}
        window.rbiActiveData.accountNumber = null
        window.rbiActiveData.bankAccount = null
        window.rbiActiveData.currentOperations = null
        window.rbiActiveData.allOperationsById = null

        #set the data manager
        window.rbiDataManager = new DataManager()

        #set global rbi color for dynamic use
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

        window.rbiIcons =
            plus:
                encoded: "&#57602;"
                decoded: ""
            minus:
                encoded: "&#57601;"
                decoded: ""
            positiveEvolution:
                encoded: "&#57641;"
                decoded: ""
            negativeEvolution:
                encoded: "&#57643;"
                decoded: ""
            search:
                encoded: "&#57471;"
                decoded: ""
            variableCost:
                encoded: "&#57393;"
                decoded: ""
            config:
                encoded: "&#57486;"
                decoded: ""
            deleteItem:
                encoded: "&#57512;"
                decoded: ""


        #instantiate collections: banks, operations, amounts
        window.collections.banks = new BanksCollection()
        window.collections.operations = new BankOperationsCollection()
        window.collections.amounts = new BankAmountsCollection()
        window.collections.regularOperations = new RegularOperationsCollection()

        ###
                views
        ###
        # this one is tricky - it lays down the structure, so it needs to be rendered
        # before any other view using that structure
        window.views.appView = new AppView()
        window.views.appView.render()

        window.activeObjects = {}
        _.extend(window.activeObjects, Backbone.Events);


        # Routing management
        Router = require 'router'
        @router = new Router()

        # Makes this object immuable.
        Object.freeze this if typeof Object.freeze is 'function'