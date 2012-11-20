# loggly-console

Loggly wrapper for console.log (Agilio version to fix the `options` argument
and prevent possible future surprises).

## Example

    var augmentConsole = require("loggly-console")

    augmentConsole({
        subdomain: "your loggly sub domain"
        , inputKey: "your input key"
    })

    // Now console.log / error / etc is overwritten to send logging data
    // directly to your loggly input.

## Installation

`npm install loggly-console`

## Contributors

 - Raynos

## MIT Licenced