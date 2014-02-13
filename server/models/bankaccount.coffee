americano = require 'americano'
async = require 'async'

BankOperation = require './bankoperation'
BankAlert = require './bankalert'

module.exports = BankAccount = americano.getModel 'bankaccount',
    bank: String
    bankAccess: String
    title: String
    accountNumber: String
    initialAmount: Number
    lastChecked: Date

BankAccount.all = (callback) ->
    BankAccount.request "all", (err, accounts) ->
        BankAccount.calculateBalance accounts, callback

BankAccount.allFromBank = (bank, callback) ->
    params =
        key: bank.uuid
    BankAccount.request "allByBank", params, (err, accounts) ->
        BankAccount.calculateBalance accounts, callback

BankAccount.findMany = (accountIDs, callback) ->
    ids = []
    ids.push accountID for accountID in accountIDs
    params = key: ids
    BankAccount.request "all", (err, accounts) ->
        BankAccount.calculateBalance accounts, callback


# When a new account is added, we need to set its initial amount
# so it works nicely with the "getBalance" view
BankAccount.initializeAmount = (relatedAccounts, callback) ->
    BankAccount.all (err, accounts) ->
        # we only want new accounts to be initalized
        accountsToProcess = []
        for account in accounts
            for relatedAccount in relatedAccounts
                if account.accountNumber is relatedAccount.accountNumber
                    accountsToProcess.push account

        process = (account, callback) ->
            newAmount = account.initialAmount - account.__data.operationSum
            attr = initialAmount: newAmount.toFixed 2
            account.updateAttributes attr, (err) ->
                callback err

        async.each accountsToProcess, process, (err) ->
            callback err

# Adds the calculated balance for a list of accounts
BankAccount.calculateBalance = (accounts, callback) ->
    calculatedAccounts = []
    BankOperation.rawRequest "getBalance", group: true, (err, balances) ->
        for account, i in accounts
            calculatedAccounts.push account.toJSON()
            accountNumber = account.accountNumber
            initialAmount = account.initialAmount

            for balance in balances
                if balance.key is accountNumber
                    amount = (initialAmount + balance.value).toFixed 2
                    accounts[i].setBalance parseFloat amount
                    accounts[i].__data.operationSum = balance.value.toFixed 2

        callback err, accounts

# Adds array of last year amounts for a list of accounts
BankAccount.prepareLastYearAmounts = (account, callback) ->
    arrayOfAmounts = []
    BankOperation.rawRequest "getBalance", group: true, (err, balances) ->
        for balance in balances
            if balance.key is account.accountNumber
                amount = (account.initialAmount + balance.value).toFixed 2
                account.setBalance parseFloat amount
        currentAmount = account.getBalance()
        currentDate = (new Date()).setHours 12,0,0,0
        BankOperation.allFromBankAccountDate account, (err, operations) ->
            for operation in operations
                currentAmount = (currentAmount - operation.amount).toFixed 2
                operationDate = (operation.date).setHours 12,0,0,0
                if currentDate isnt operationDate
                    arrayOfAmounts.push
                        date : operation.date
                        amount : currentAmount
                    currentDate = operationDate
            callback err, arrayOfAmounts


BankAccount::getBalance = ->
    return @__data.amount

BankAccount::setBalance = (balance) ->
    @__data.amount = balance

BankAccount::setArrayOfAmounts = (arrayOfAmounts) ->
    @__data.arrayOfAmount = arrayOfAmounts

BankAccount::toJSON = ->
    json = @toObject true
    json.amount = @getBalance()
    return json