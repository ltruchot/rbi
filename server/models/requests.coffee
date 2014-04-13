# See documentation on https://github.com/frankrousseau/americano-cozy/#requests
americano = require 'americano'

allByName = (doc) -> emit doc.name, doc
byUuid = (doc) -> emit doc.uuid, doc
allByTitle = (doc) -> emit doc.title, doc
allByBank = (doc) -> emit doc.bank, doc
allByBankAccount = (doc) -> emit doc.bankAccount, doc
allReportsByFrequency = (doc) -> emit [doc.type, doc.frequency], doc
allByBankAccountAndType = (doc) -> emit [doc.bankAccount, doc.type], doc
allByBankAccountAndDate = (doc) -> emit [doc.bankAccount, doc.date], doc
allByAccountNumber = (doc) -> emit doc.accountNumber, doc
allByDate = (doc) ->
    if (doc.msisdn isnt "NULL") and doc.latitude and doc.longitude
        emit doc.timestamp, doc

allOperationsLike = (doc) ->
    emit [doc.bankAccount, doc.date, doc.amount.toFixed(2), doc.title], doc
getBalance =
    map: (doc) ->
        emit doc.bankAccount, doc.amount
    reduce: (keys, values, rereduce) ->
        sum values
getBanksWithAccounts =
    map: (doc) ->
        emit doc.bank, 1
    reduce: (keys, values, rereduce) ->
        return 1

module.exports =


    # template:
    #     # shortcut for emit doc._id, doc
    #     all: americano.defaultRequests.all

    #     # create all the requests you want!
    #     customRequest:
    #         map: (doc) ->
    #             # map function
    #         reduce: (key, values, rereduce) ->
    #             # non mandatory reduce function
    bank:
        all: allByName
        byUuid: byUuid


    bankaccount:
        all: allByTitle
        allByBank: allByBank
        bankWithAccounts: getBanksWithAccounts

    bankoperation:
        all: americano.defaultRequests.all
        allByBankAccount: allByBankAccount
        allByBankAccountAndDate: allByBankAccountAndDate
        allLike: allOperationsLike
        getBalance: getBalance

    bankalert:
        all: americano.defaultRequests.all
        allByBankAccount: allByBankAccount
        allReportsByFrequency: allReportsByFrequency
        allByBankAccountAndType: allByBankAccountAndType

    rbiconfig:
        all: americano.defaultRequests.all

    rbifixedcost:
        all: americano.defaultRequests.all
        allByAccountNumber: allByAccountNumber

    geolocationlog:
        all: americano.defaultRequests.all
        allByDate: allByDate

    receiptdetail:
        byBarcode: (doc) ->
            emit doc.barcode, doc
            return

        byReceiptId: (doc) ->
            unless doc.receiptId

                # Old receiptDetail format.
                #doc.receiptId = doc.ticketId;
                emit doc.ticketId, doc
            else
                emit doc.receiptId, doc
            return

    receipt:
        byTimestamp: (doc) ->
            emit doc.timestamp, doc
            return