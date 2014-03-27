
BankOperation = require '../models/bankoperation'

module.exports.loadBankOperation = (req, res, next, bankOperationID) ->
    BankOperation.find bankOperationID, (err, operation) =>
        if err? or not operation?
            res.send 404, error: "BankOperation not found"
        else
            @operation = operation
            next()

module.exports.index = (req, res) ->
    BankOperation.all (err, operations) ->
        if err
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, operations

module.exports.show = (req, res) ->
    res.send 200, @operation

module.exports.query = (req, res) ->

    paramAccounts = req.body.accounts or [-1]

    BankOperation.allFromBankAccounts paramAccounts, (err, operations) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            paramDateFrom = new Date req.body.dateFrom
            paramDateTo = new Date req.body.dateTo
            paramAmountFrom =  Number req.body.amountFrom
            paramAmountTo = Number req.body.amountTo
            paramSearchText = req.body.searchText
            paramExactSearchText = req.body.exactSearchText or ""
            async = require "async"

            treatment = (operation, callback) ->
                # apply filters to dermine if the operation should be returned
                amount = Number operation.amount
                date = new Date operation.date
                title = operation.title.toLocaleUpperCase()
                paramQueryText = paramSearchText.toLocaleUpperCase()
                paramQueryExactText = paramExactSearchText.toLocaleUpperCase()

                # dates
                if date < paramDateFrom or date > paramDateTo
                    callback null

                # amounts
                else if amount < paramAmountFrom or amount > paramAmountTo
                    callback null

                # text search
                else if paramSearchText? and paramSearchText isnt "" and \
                        title.search(paramQueryText) < 0
                    callback null

                # exact text search
                else if paramExactSearchText? and paramExactSearchText isnt "" and \
                        title isnt paramQueryExactText
                    callback null

                # the right one
                else
                    callback null, operation

            # check all bank operations
            async.concat operations, treatment, (err, results) ->
                if err?
                    errorMsg = 'Server error occurred while retrieving data'
                    res.send 500, error: errorMsg
                else
                    res.send 200, results

module.exports.byDate = (req, res) ->
    paramAccounts = req.body.accounts or [-1]
    BankOperation.allFromBankAccounts paramAccounts, (err, operations) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            paramDateFrom =  new Date req.body.dateFrom
            paramDateTo = new Date req.body.dateTo
            paramSearchText = req.body.searchText
            credits = Boolean req.body.credits
            debits = Boolean req.body.debits
            fixedCosts = Boolean req.body.fixedCosts
            variableCosts = Boolean req.body.variableCosts
            async = require "async"

            treatment = (operation, callback) ->
                # apply filters to dermine if the operation should be returned
                amount = Number operation.amount
                date = new Date operation.date
                title = operation.title.toLocaleUpperCase()
                paramQueryText = if paramSearchText? then paramSearchText.toLocaleUpperCase() else null

                # dates
                if date < paramDateFrom or date > paramDateTo
                    callback null

                # text search
                else if paramSearchText? and paramSearchText isnt "" and \
                        title.search(paramQueryText) < 0
                    callback null

                #credit search
                else if credits and amount < 0
                    callback null

                #debit search
                else if debits and amount > 0
                    callback null

                # the right one
                else
                    callback null, operation

            # check all bank operations
            async.concat operations, treatment, (err, results) ->
                if err?
                    errorMsg = 'Server error occurred while retrieving data'
                    res.send 500, error: errorMsg
                else
                    # if fixedCosts or variableCosts
                    #     console.log 'costs !'
                    res.send 200, results


###
    dev only
###
module.exports.create = (req, res) ->
    BankOperation.create body, (err, operation) ->
        if err?
            res.send 500, error: "Server error while creating bank operation"
        else
            res.send 201, operation