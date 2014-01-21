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
                    'vendor/scripts/jquery.sparkline-2.1.2.js'
                    'vendor/scripts/jquery.flot-0.8.2.js'
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
                after: ['vendor/styles/helpers.css']

        templates:
            defaultExtension: 'jade'
            joinTo: 'javascripts/app.js'
