ReceiptView = require("./receipt")
ReceiptCollection = require("collections/receipts")
ReceiptTotalView = require("./receiptmonth")
ReceiptTotalsCollection = require("collections/receipttotals")
module.exports = IntermarcheView = Backbone.View.extend(

  #el: '#content',
  template: require("../templates/intermarche")

  # initialize is automatically called once after the view is constructed
  initialize: ->
    @getDays()
    return

  events:
    "click #day": "getDays"
    "click #month": "getMonths"

  render: ->

    # we render the template
    @$el.html @template(title: "Mes Courses")
    return


  # fetch the bookmarks from the database
  #        this.collection.fetch();
  showLoader: (show) ->
    if show
      @$el.find("#loader").show()
    else
      @$el.find("#loader").hide()
    return

  toggleList: (period) ->
    other_map =
      "#month": "#day"
      "#day": "#month"

    @$el.find(period).toggleClass "period_button period_button-selected"
    @$el.find(other_map[period]).toggleClass "period_button-selected period_button"

    #this.$el.find(period).removeClass("period_button").addClass("period_button-selected");

    #this.$el.find(other_map[period]).removeClass("period_button-selected").addClass("period_button");
    @stopListening @collection
    @$el.find("#list").empty()
    @showLoader true
    return

  collectionFetch: ->
    that = this
    that.$el.find(".nodata").hide()
    @collection.fetch
      success: (collection, response, options) ->
        that.showLoader false
        that.$el.find(".nodata").show()  if collection.length is 0
        return

      error: (collection, response, options) ->
        that.stopLoader()
        return

    return

  getDays: ->
    return  if @state is "#day"
    @state = "#day"
    @toggleList "#day"
    @collection = new ReceiptCollection()
    @listenTo @collection, "add", @onReceiptAdded

    #this.collection.fetch();
    @collectionFetch()
    return

  onReceiptAdded: (receipt) ->
    @showLoader false

    # render the specific element
    receiptView = new ReceiptView(model: receipt)
    receiptView.render()
    @$el.find("#list").append receiptView.$el
    return

  getMonths: ->
    return  if @state is "#month"
    @state = "#month"
    @toggleList "#month"
    @collection = new ReceiptTotalsCollection()
    @listenTo @collection, "add", @onReceiptTotalAdded

    #this.collection.fetch();
    @collectionFetch()
    return

  onReceiptAdded: (receipt) ->

    #this.showLoader(false);
    # render the specific element
    receiptView = new ReceiptView(model: receipt)
    receiptView.render()
    @$el.find("#list").append receiptView.$el
    return

  onReceiptTotalAdded: (data) ->

    #this.showLoader(false);
    # render the specific element
    rtView = new ReceiptTotalView(model: data)
    rtView.render()
    @$el.find("#list").append rtView.$el
    return
)