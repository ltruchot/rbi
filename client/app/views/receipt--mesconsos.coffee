SectionView = require("./section")
SectionCollection = require("../collections/sections")
module.exports = Receipt = Backbone.View.extend(
  tagName: "div"
  template: require("../templates/receipt")
  events:
    "click .receipt": "toggleSections"


  #"click .toggle": "toggleSectionsNoDefault"
  initialize: ->
    @collection = new SectionCollection([],
      receiptId: @model.attributes.receiptId
    )
    return

  render: ->
    @$el.html @template(receipt: @model.toJSON())
    return

  btnState: (state) ->
    states =
      opened: "img/moins.png"
      closed: "img/plus.png"
      loading: "img/ajax-loader_b.gif"

    @$el.find(".toggle-btn").attr "src", states[state]
    return

  toggleSections: (event) ->
    unless @open
      @open = true

      # submit button reload the page, we don't want that
      #event.preventDefault();
      @btnState "loading"
      @listenTo @collection, "add", @onSectionAdded

      # fetch the bookmarks from the database
      @collection.fetch()

    #this.$el.find('.toggle-btn').attr('src', "img/moins.png");
    else
      @stopListening @collection
      @$el.find(".sections").empty()
      @btnState "closed"
      @open = false
    return

  onSectionAdded: (section) ->
    @btnState "opened"

    # render the specific element
    sectionView = new SectionView(model: section)
    sectionView.render()
    @$el.find(".sections").append sectionView.$el
    return
)