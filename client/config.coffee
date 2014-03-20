exports.config =
    # See docs at http://brunch.readthedocs.org/en/latest/config.html.
    #coffeelint:
        #pattern: /^app\/.*\.coffee$/
        #options:
            #indentation:
                #value: 4
                #level: "error"

    files:
        javascripts:
            joinTo:
                'javascripts/app.js': /^app/
                'javascripts/vendor.js': /^vendor/
            order:
                # Files in `vendor` directories are compiled before other files
                # even if they aren't specified in order.
                before: [
                    'vendor/scripts/jquery-2.0.3.js'
                    'vendor/scripts/underscore-1.5.2.js'
                    'vendor/scripts/backbone-1.1.0.js'
                    'vendor/scripts/bootstrap-3.0.3.js'
                    'vendor/scripts/jquery.easypiechart-2.1.3'
                    'vendor/scripts/async-0.2.10.js'
                    'vendor/scripts/jquery.flot-0.8.2.js'
                    'vendor/scripts/jquery.flot.time-0.8.2.js'
                    'vendor/scripts/jquery.flot.tooltip-0.6.5.js'
                    'vendor/scripts/jquery.flot.pie-0.8.2.js'
                    'vendor/scripts/moment-with-langs-fr-2.5.1.js'
                    # 'vendor/scripts/jsapi.js'
                ]

        stylesheets:
            joinTo: 'stylesheets/app.css'
            order:
                before: [
                    'vendor/styles/normalize.css'
                    'vendor/styles/bootstrap-3.0.3.css'
                    'vendor/styles/bootstrap-editable.css'
                    'vendor/styles/main.css'
                ]
                after: [
                    'vendor/styles/helpers.css'
                ]

        templates:
            defaultExtension: 'jade'
            joinTo: 'javascripts/app.js'
