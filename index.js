const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const https = require('https')
const http = require('http')
const cors = require('cors')
const { join } = require('path')
const helmet = require('helmet')

module.exports = {
  name: 'express',
  dependencies: ['core'],
  construct({ core }, config) {
    const expressApp = express()

    expressApp.get('ping', (req, res) => {
      res.send('pong')
    })

    expressApp.use(cors({
      origin: (origin, callback) => {
        console.log(origin)
        const success = origin.startsWith(`https://${config.express.host}`)
        callback(success ? null : new Error('Not allowed'), success)
      },
      credentials: true
    }))

    expressApp.use(cookieParser())
    expressApp.use(bodyParser.json())
    expressApp.use(bodyParser.urlencoded({ extended: false }))

    expressApp.use((req, res, next) => {
      console.log(req.method, req.url, JSON.stringify(req.body, null, ' '))
      next()
    })
    const protocol = config.express.mode === 'http' ? http : https
    const server = protocol.createServer({
      ...(config.express?.options || {})
    }, expressApp)

    expressApp.get('/ping', (req, res) => {
      res.send('pong')
    })
    expressApp.use(express.static(config.dist))

    core.on('ready', () => {
      console.log(`Listening on port ${config.express.port}`)
      expressApp.use('/*', (req, res) => {
        res.sendFile(join(config.dist, 'index.html'))
      })
      server.listen(config.express.port, '127.0.0.1')
    })

    return expressApp
  }
}