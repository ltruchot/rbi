americano = require "americano"
module.exports = Receipt = americano.getModel "receipt",
  receiptId: String
  transactionCode: String
  transaction: String
  transactionId: String
  timestamp: Date
  checkoutId: String
  checkoutReceiptId: String
  cashierId: String
  articlesCount: Number
  amount: Number
  loyaltyBalance: Number
  convertedPoints: Number
  acquiredPoints: Number
  intermarcheShopId: String
  total: Number
  paidAmound: Number
  isOnline: Boolean
  snippet: String



Receipt.newest = (callback) ->
  Receipt.request "byTimestamp",
    descending: true
  , (err, instances) ->
    callback null, instances
    return

  return

