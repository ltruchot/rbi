GeolocationLog = require '../models/geolocationlog'

module.exports.loadGeolocationLog = (req, res, next, geolocationLogID) ->
    GeolocationLog.find geolocationLogID, (err, geolocationlog) =>
        if err? or not geolocationlog?
            res.send 404, error: "GeolocationLog not found"
        else
            @geolocationlog = geolocationlog
            next()

module.exports.index = (req, res) ->
    GeolocationLog.all (err, geolocationlogs) ->
        if err
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, geolocationlogs

module.exports.byDate = (req, res) ->

    GeolocationLog.all (err, geolocationLogs) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            #console.log req.body
            paramDateFrom =  new Date req.body.dateFrom
            paramDateTo = new Date req.body.dateTo
            async = require "async"

            treatment = (geolocationlog, callback) ->
                # apply filters to dermine if the geolocationlog should be returned
                date = new Date geolocationlog.date

                # dates
                if date < paramDateFrom or date > paramDateTo
                    callback null

                # the right one
                else
                    callback null, geolocationlog

            # check all bank geolocationLogs
            async.concat geolocationLogs, treatment, (err, results) ->
                if err?
                    errorMsg = 'Server error occurred while retrieving data'
                    res.send 500, error: errorMsg
                else
                    # if fixedCosts or variableCosts
                    res.send 200, results

module.exports.allByDate = (req, res) ->
    startDate =  new Date req.body.dateFrom
    endDate = new Date req.body.dateTo

    GeolocationLog.allByStartAndEndDate startDate, endDate, (err, geolocationLogs) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, geolocationLogs

module.exports.getMostRecent = (req, res) ->
    GeolocationLog.getMostRecent (err, geolocationLog) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, (geolocationLog[0] or null)