americano = require 'americano'

module.exports = GeolocationLog = americano.getModel 'geolocationlog',
    idMesInfos: String
    latitude: Number
    longitude: Number
    msisdn: String
    origin: String
    radius: Number
    snippet: String
    timestamp: String


GeolocationLog.all = (callback) ->
    GeolocationLog.request 'all', (err, geolocationLogs) ->
        return callback err if err
        callback null, geolocationLogs

GeolocationLog.allByStartAndEndDate = (startDate, endDate, callback) ->
    params =
        startkey: (new Date startDate).toISOString()
        endkey: (new Date endDate).toISOString()

        # startkey=["1970-01-01T00:00:00Z", ""]&endkey=["\ufff0", "1971-01-01T00:00:00Z"]
        # descending: true
    GeolocationLog.request "allByDate", params, callback
