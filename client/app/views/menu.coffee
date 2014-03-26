BaseView = require '../lib/base_view'
module.exports = class MenuView extends BaseView

  template: require('./templates/menu')

  el: 'div#mainnav'

  # events:
  #   'click .menu-item' : 'activateMenuItem'

  subViews: []

  initialize: ->

  render: ->

    # lay down the template
    super()
    view = @

    @

  afterRender: ->
    @adjustPadding()
    that = @
    window.app.router.bind "route", (method) ->
      route = null
      if method?
        for currentRoute, currentMethod of window.app.router.routes
          if (currentRoute isnt "") and (currentMethod is method)
            route = currentRoute
            break
      if route?
        $('.menu-item').each ->
          if $(@).children('a').attr("href").replace("#", "") is route
            that.activateMenuItem $(@)
            return false

      if $("#context-box").html() is ""
        $("#context-box").hide()
      else
        $("#context-box").show()

  activateMenuItem: (jqMenuItem)->
    #jqMenuItem = $(event.currentTarget)
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