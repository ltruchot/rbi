BaseView = require '../lib/base_view'
module.exports = class MenuView extends BaseView

  template: require('./templates/menu')

  el: 'div#mainnav'

  events:
    'click .menu-item' : 'activateMenuItem'

  subViews: []

  initialize: ->

  render: ->
      # lay down the template
      super()
      view = @

      @

  activateMenuItem: (event)->
    jqMenuItem = $(event.currentTarget)
    if not jqMenuItem.hasClass 'active'
      $('.menu-item').removeClass 'active'
      $('.current-arrow').remove()
      jqMenuItem.addClass 'active'
      jqMenuItem.prepend $('<span class="current-arrow"></span>')
