BaseView = require '../lib/base_view'
BankStatementView = require "./bank_statement"

module.exports = class GeolocatedReportView extends BaseView

  template: require './templates/geolocated_report'

  el: 'div#interface-box'

  events:
    'click .day-switcher' : 'switchDay'

  bounds: null

  allMarkers: []

  constructor: (@model) ->
    super()



  render: ->
    window.views.appView.cleanBankStatement()
    @bankStatementView = new BankStatementView $('#context-box')
    @bankStatementView.mapLinked = true
    @bankStatementView.render()

    # lay down the template
    super()
    @loadFirstDayMap()
    #@switchDay()
    now = new Date()
    bankStatementParams =
      accounts: [window.rbiActiveData.accountNumber]
      amountFrom: Number.NEGATIVE_INFINITY
      amountTo: Number.POSITIVE_INFINITY
      dateFrom: moment(moment(now).subtract('y', 1)).format 'YYYY-MM-DD'
      dateTo: moment(now).format 'YYYY-MM-DD'
    @bankStatementView.reload bankStatementParams

  loadFirstDayMap: ->
    @$el.find(".geolocated-report-error").hide()
    @$el.find(".geolocated-report-loader").show()
    $.ajax
      type: "GET"
      url: "geolocationlog/getMostRecent"
      success: (geolocationLog) =>
        if geolocationLog? and (typeof(geolocationLog) is "object") and geolocationLog.timestamp?
          @switchDay null, geolocationLog.timestamp
        else
          @$el.find(".geolocated-report-title").html 'Relevé Géolocalisé'
          @$el.find(".geolocated-report-error")
            .html("Ce service nécessite les données de l'opérateur Orange.<br /><br /> Aucune donnée de géolocalisation trouvée.")
            .show()
      error: =>
        @$el.find(".geolocated-report-title").html 'Relevé Géolocalisé'
        @$el.find(".geolocated-report-error")
          .html 'Une erreur est survenue lors du chargement des données.<br /<br />Veuillez réessayer ultérieurement.'
          .show()
      complete: =>
        @$el.find(".geolocated-report-loader").hide()


  switchDay: (evt, date)->
    @$el.find(".geolocated-report-error").hide()
    @$el.find("#msisdn-geolocation-map").css "visibility", "hidden"
    @$el.find(".geolocated-report-loader").show()
    if @map?
      @map.closePopup()
    today = moment(new Date()).startOf "day"
    firstDay = moment(window.rbiActiveData.olderOperationDate).startOf 'day'
    if evt? and evt.currentTarget?
      jqSwitcher = $(evt.currentTarget)
      if jqSwitcher.hasClass 'previous-day'
        @currentDate.subtract('day', 1).startOf 'day'
      else if jqSwitcher.hasClass 'next-day'
        @currentDate.add('day', 1).startOf('day')
    else

      #tip to avoid GMT modifier bug
      if date? and (date isnt "") then date = new Date(new Date(date).setUTCHours(3))

      @currentDate = moment(moment(date or today).startOf "day")


    #show/hide previous/next month button
    if moment(@currentDate).format("YYYY-MM-DD") is today.format("YYYY-MM-DD")
      $('.next-day').hide()
    else
      $('.next-day').show()
    if (firstDay.format("YYYY-MM-DD") isnt today.format("YYYY-MM-DD")) and (@currentDate.format("YYYY-MM-DD") is firstDay.format("YYYY-MM-DD"))
      $('.previous-month').hide()
    else
      $('.previous-month').show()

    @$("#current-day").html "Le " + (@currentDate.format "dddd DD MMMM YYYY")

    $.ajax
      type: "POST"
      url: "geolocationlog/allByDate"
      data:
        dateFrom: @currentDate.format "YYYY-MM-DD HH:mm"
        dateTo: moment(@currentDate.endOf("day")).format "YYYY-MM-DD HH:mm"
      success: (geolocationLogs) =>
        @$el.find("#msisdn-geolocation-map").css "visibility", "visible"
        polylineTable = []
        markerTable = []
        lastLocation = null
        for log in geolocationLogs
          if log.longitude? and log.latitude?
            alreadyRegistered = false
            lastLocation = [log.latitude, log.longitude]
            polylineTable.push lastLocation

            newTime = (moment(log.timestamp).format "HH") + "h" + (moment(log.timestamp).format "mm")
            for marker in markerTable
              if (marker.location[0] is lastLocation[0]) and (marker.location[1] is lastLocation[1])
                alreadyRegistered = true
                #tip to display a <br /> every 4 times displayed
                addTag = if (marker.time.match(/\h/g).length % 5) is 0 then ",<br />" else ", "
                if not marker.time.match(/\.\.\./)?
                  if marker.time.length < 300
                    marker.time += addTag + newTime
                    marker.plural = true
                  else
                    marker.time += "..."
                break

            if not alreadyRegistered
              markerTable.push
                location: lastLocation
                time: newTime

        if markerTable.length is 1
          markerTable[0].time = "Toute la journée à cette adresse."


        #set new polygon
        if polylineTable.length > 0
          if @map? and @polyline?
            @map.removeLayer @polyline
          @polyline = L.polyline polylineTable
          @bounds = @polyline.getBounds()

        #remove previous markers
        if @map? and @allMarkers? and (@allMarkers.length > 0)
          for previousMarker in @allMarkers
            @map.removeLayer previousMarker
          @allMarkers = []



        if lastLocation?
          if (not @map?) or $("#msisdn-geolocation-map").html() is ""
            if $("#msisdn-geolocation-map").length is 1
              @map = L.map('msisdn-geolocation-map').setView lastLocation, 1
              @layer = L.tileLayer 'http://{s}.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/997/256/{z}/{x}/{y}.png',
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
              @layer.addTo @map
        else
          if @map?
            @map.remove()
            @map = null
          $("#msisdn-geolocation-map").html ""
          $("#msisdn-geolocation-map").attr 'class', ""
          @$el.find(".geolocated-report-error")
            .html("Aucune donnée de géolocalisation trouvée ce jour.")
            .show()


      #clean old polygon
        if @polyline? and @map?
          @polyline.addTo @map

          for point in markerTable
            message = ""
            if markerTable.length > 1
              if point.plural
                message = "&Agrave cette adresse aux heures suivantes : <br /><br /><em>" + point.time + "</em>"
              else
                message = "&Agrave cette adresse à <em>" + point.time + "</em>"
            else
              message = point.time
            @allMarkers.push L.marker(point.location)
            @allMarkers[@allMarkers.length - 1].setIcon(window.rbiIcons.marker).bindPopup(message)
            @map.addLayer @allMarkers[@allMarkers.length - 1]

          if @bounds
            @map.fitBounds @bounds

      error: =>
        @$el.find(".geolocated-report-title").html 'Relevé Géolocalisé'
        @$el.find(".geolocated-report-error")
          .html 'Une erreur est survenue lors du chargement des données.<br /<br />Veuillez réessayer ultérieurement.'
          .show()

      complete: =>
        @$el.find(".geolocated-report-loader").hide()

    @