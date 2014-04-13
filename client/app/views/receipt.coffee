BaseView = require '../lib/base_view'
SectionView = require "./section"
SectionCollection = require "../collections/sections"
module.exports = class Receipt extends BaseView
  tagName: "div"
  template: require "./templates/receipt"


  #"click .toggle": "toggleSectionsNoDefault"
  constructor: (@model) ->
    super()

  initialize: ->
    @collection = new SectionCollection [],
      receiptId: @model.attributes.receiptId

  render: ->
    @$el.html @template(receipt: @model.toJSON())
    @listenTo @collection, "add", @onSectionAdded
    @collection.fetch()
    @


  onSectionAdded: (section) ->

    # render the specific element
    sectionView = new SectionView(model: section)
    sectionView.render()
    @$el.find(".sections").append sectionView.$el

