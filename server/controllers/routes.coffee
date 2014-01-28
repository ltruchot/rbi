# See documentation on https://github.com/frankrousseau/americano#routes
index = require './index'
banks         = require './banks'
bankaccesses  = require './bankaccesses'
bankaccounts = require './bankaccounts'
bankoperations = require './bankoperations'
bankalerts = require './bankalerts'

module.exports =
    'foo':
        get: index.main
    'banks':
        get: banks.index
    'bankID': param: banks.loadBank
    'banks/:bankID':
        get: banks.show
        del: banks.destroy
    'banks/getAccesses/:bankID':
        get: banks.getAccesses
    'banks/getAccounts/:bankID':
        get: banks.getAccounts

    'bankaccesses':
        get: bankaccesses.index
        post: bankaccesses.create
    'bankAccessID': param: bankaccesses.loadBankAccess
    'bankaccesses/:bankAccessID':
        get: bankaccesses.show
        put: bankaccesses.update
        del: bankaccesses.destroy
    'bankaccesses/getAccounts/:bankAccessID':
        get: bankaccesses.getAccounts

    'bankaccounts':
        get: bankaccounts.index
    'bankAccountID': param: bankaccounts.loadBankAccount
    'bankaccounts/:bankAccountID':
        get: bankaccounts.show
        del: bankaccounts.destroy
    'bankaccounts/getOperations/:bankAccountID':
        get: bankaccounts.getOperations
    'bankaccounts/retrieveOperations/:bankAccountID':
        get: bankaccounts.retrieveOperations
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