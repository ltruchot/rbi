# americano = require 'americano'

# port = process.env.PORT || 9250
# americano.start name: 'template', port: port

americano = require 'americano'
init = require './server/init'

require './tests/mock-weboob'

port = process.env.PORT || 9875

americano.start name: 'rbi', port: port, ->
    init ->
        console.log "=> Server intialized!"