module.exports = Section = Backbone.View.extend(
  tagName: "div"
  template: require("../templates/section")
  render: ->
    @$el.html @template(section: @model.toJSON())
    return
)