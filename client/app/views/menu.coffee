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

  afterRender: ->
    @adjustPadding()

  activateMenuItem: (event)->
    jqMenuItem = $(event.currentTarget)
    if not jqMenuItem.hasClass 'active'
      $('.menu-item').removeClass 'active'
      $('.current-arrow').remove()
      jqMenuItem.addClass 'active'
      jqMenuItem.prepend $('<span class="current-arrow"></span>')
    if $(window).width() < 768
      window.scrollTo 0,535

  adjustPadding: ->
    $('#mainnav .menu-item > a').each ->
      text = $(@).text() or null
      if text.length? and (text.length > 25)
        $(@).css
          'padding-top': '10px'
      else if text.length? and  (text.length < 11)
        $(@).css
          'padding-top': '20px'
      else
        $(@).css
          'padding-top': '16px'