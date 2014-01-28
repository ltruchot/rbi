BankAmount = require '../models/bank_amount'

module.exports = class BankAmounts extends Backbone.Collection

    model: BankAmount
    url: "bankaccounts"

    setAccount: (@account) ->
        @url = "bankaccounts/getLastYearAmounts/" + @account.get("id")
        #console.log @url