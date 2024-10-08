const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const https = require('https')
const http = require('http')
const { join } = require('path')

module.exports = {
  name: 'express',
  dependencies: [
    require('sools-core-server'),
  ],
  construct({ core }, { express: config }) {
    const expressApp = express()

    expressApp.get('ping', (req, res) => {
      res.send('pong')
    })

    expressApp.use(cookieParser())
    expressApp.use(bodyParser.json())
    expressApp.use(bodyParser.urlencoded({ extended: false }))


    const protocol = config.mode === 'http' ? http : https
    const server = protocol.createServer({
      ...(config?.options || {})
    }, expressApp)

    if (config.dist) {
      expressApp.use(config.dist.publicPath, express.static(config.dist.path))
    }

    expressApp.use((req, res, next) => {
      console.log(req.method, req.url, JSON.stringify(req.body, null, ' '))
      next()
    })

    core.on('ready', () => {
      console.log(`Listening on port ${config.port}`)
      if (config.dist) {
        expressApp.use('/*', (req, res) => {
          res.sendFile(join(config.dist.path, 'index.html'))
        })
      }
      server.listen(config.port, '0.0.0.0')
    })

    return expressApp
  }
}