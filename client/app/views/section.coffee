BaseView = require '../lib/base_view'
module.exports = class Section extends BaseView
  tagName: "div"
  template: require "./templates/section"
  render: ->
    @$el.html @template(section: @model.toJSON())
    return
