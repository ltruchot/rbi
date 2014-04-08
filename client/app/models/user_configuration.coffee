module.exports = class Config extends Backbone.Model

    url: 'rbiconfiguration'
    isNew: -> true
    defaults:
      accountNumber:''
      depositList: []
      budgetByAcount: {}
      mostRecentOperationDate: ''

