# See documentation on https://github.com/frankrousseau/americano#routes
index = require './index'
banks         = require './banks'
bankaccounts = require './bankaccounts'
bankoperations = require './bankoperations'
bankalerts = require './bankalerts'
rbiconfig = require './rbiconfig'
rbifixedcost = require './rbifixedcost'

module.exports =
    'foo':
        get: index.main
    'banks':
        get: banks.index
    'bankID': param: banks.loadBank
    'banks/:bankID':
        get: banks.show
    'banks/getAccounts/:bankID':
        get: banks.getAccounts

    'bankaccounts':
        get: bankaccounts.index
    'bankAccountID': param: bankaccounts.loadBankAccount
    'bankaccounts/:bankAccountID':
        get: bankaccounts.show

    'bankaccounts/getOperations/:bankAccountID':
        get: bankaccounts.getOperations
    'bankaccounts/getLastYearAmounts/:bankAccountID':
        get: bankaccounts.getLastYearAmounts

    'bankoperations':
        get: bankoperations.index
        post: bankoperations.create
    'bankOperationID': param: bankoperations.loadBankOperation
    'bankoperations/:bankOperationID':
        get: bankoperations.show
    'bankoperations/query':
        post: bankoperations.query
    'bankoperations/byDate':
        post: bankoperations.byDate


    'bankalerts':
        get: bankalerts.index
        post: bankalerts.create
    'bankAlertID': param: bankalerts.loadAlert
    'bankalerts/:bankAlertID':
        get: bankalerts.show
        put: bankalerts.update
        del: bankalerts.destroy
    'bankalerts/getForBankAccount/:accountID':
        get: bankalerts.getForBankAccount
    'rbiconfiguration':
        post: rbiconfig.setConfig
        get: rbiconfig.getConfig
    'rbifixedcost':
        post: rbifixedcost.setFixedCost
        get: rbifixedcost.getFixedCost
    'rbifixedcostID': param: rbifixedcost.loadFixedCost
    'rbifixedcost/:rbifixedcostID':
        get: rbifixedcost.show
        put: rbifixedcost.update
        del: rbifixedcost.destroy