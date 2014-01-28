AppView = require 'views/app'

module.exports = class Router extends Backbone.Router

  routes:
      '': 'parametres'

  parametres: ->
    window.views.configurationView?.render()
