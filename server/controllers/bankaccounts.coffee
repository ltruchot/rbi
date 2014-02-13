BankAccount = require '../models/bankaccount'
BankOperation = require '../models/bankoperation'

module.exports.loadBankAccount = (req, res, next, accountID) ->
    BankAccount.find accountID, (err, account) =>
        if err? or not account?
            res.send 404, error: "BankAccount not found"
        else
            @account = account
            next()

module.exports.index = (req, res) ->
    BankAccount.all (err, accounts) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, accounts


module.exports.show = (req, res) ->
    res.send 200, @account

module.exports.getOperations = (req, res) ->
    BankOperation.allFromBankAccountDate @account, (err, operations) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, operations

module.exports.getLastYearAmounts = (req, res) ->
    BankAccount.prepareLastYearAmounts @account, (err, operations) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, operations
