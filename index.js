var loggly = require('loggly')
    , slice = Array.prototype.slice
    , sent = false
    , util = require('util')

require('callsite')

module.exports = augmentConsole

function augmentConsole(options) {
    var client = loggly.createClient({
            subdomain: options.subdomain
            , json: true
        })
        , inputKey = options.inputKey

    ;["log", "info", "error", "debug", "warn"].forEach(modifyConsole)

    process.once("uncaughtException", handlException)

    function modifyConsole(name) {
        var old = console[name]

        console[name] = interceptConsole

        function interceptConsole(first) {
            
            log({
                message: util.format.apply(util, arguments)
                , methodName: name
                , timestamp: getUTCTimeStamp()
                , stackTrace: simplifyStackTrace(__stack)
            })
            old && old.apply(console, arguments)
        }
    }

    function getUTCTimeStamp() {
        var now = new Date(); 
        var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        return now_utc.toJSON();
    }

    function handlException(err) {
        if (sent === false) {
            sent = true
            process.stdout.write("logging exception" + err.message)
            process.stdout.write("**uncaughtException**\n" +
                err.stack + "\n")

            log({
                message: "uncaught exception"
                , methodName: "error"
                , error: err
                , timestamp: getUTCTimeStamp()
                , stackTrace : err.stack
            })
        }

        setTimeout(throwError, 3000)

        function throwError() {
            throw err
        }
    }

    function log() {
        var args = [inputKey].concat(slice.call(arguments))
        try {
            client.log.apply(client, args)
        } catch (err) {
            /* ignore errors. Most likely json stringify errors */
        }
    }

    function simplifyStackTrace(stackTrace){
        return stackTrace.map(function(call) {
            return {
                fn: call.getFunctionName() || 'anonymous',
                fileName: call.getFileName(),
                lineNumber: call.getLineNumber()
            }
        });
    }
}