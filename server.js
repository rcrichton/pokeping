'use strict'

const cors = require('cors')
const express = require('express')
const fs = require('fs')
const geolib = require('geolib')
const log = require('winston')
const http = require('http')
const https = require('https')
const moment = require('moment')

const config = require('./config.json')
const accounts = require('./accounts.json')
// eg.
// const accounts = [
//   {
//     username: 'xxx',
//     password: 'yyy'
//   }
// ]
const PoGo = require('./pokemon-go-api')

// https://www.reddit.com/r/TheSilphRoad/comments/4s7kg5/how_much_distance_one_footstep_represents/
const footprintDist = {
  zero: 40,
  one: 75,
  two: 150,
  three: 225
}

const app = express()
app.use(cors())
app.set('etag', false)

log.clear()
log.add(log.transports.Console, { timestamp: true })

accounts.forEach((acc) => {
  acc.pogo = PoGo()
})
let currAccIdx = 0

const useNextAccount = () => {
  currAccIdx++
  if (currAccIdx >= accounts.length) {
    currAccIdx = 0
  }
}

app.get('/pokemon/:lat/:long', (req, res) => {
  log.info(`GET ${req.url}`)

  const queryMap = () => {
    log.info('Querying map objects')
    let lat = parseFloat(req.params.lat)
    let long = parseFloat(req.params.long)

    accounts[currAccIdx].pogo.setLocation(lat, long)

    accounts[currAccIdx].pogo.getMapObjects((err, mapInfo) => {
      if (err) {
        log.info(err.stack)
        return res.status(500).send(err)
      }

      let foundPokemon = []

      mapInfo.map_cells.forEach((cell) => {
        cell.catchable_pokemons.forEach((mon) => {
          let distance = geolib.getDistance({latitude: lat, longitude: long}, {latitude: mon.latitude, longitude: mon.longitude})
          let compass = geolib.getCompassDirection({latitude: lat, longitude: long}, {latitude: mon.latitude, longitude: mon.longitude}).rough

          let footprints = 3
          if (distance < footprintDist.zero) {
            footprints = 0
          } else if (distance < footprintDist.one) {
            footprints = 1
          } else if (distance < footprintDist.two) {
            footprints = 2
          }

          foundPokemon.push({
            pokemonId: mon.pokemon_id,
            distance: distance,
            footprints: footprints,
            expire: moment(+mon.expiration_timestamp_ms).toDate(),
            compass: compass
          })
        })
        cell.nearby_pokemons.forEach((mon) => {
          foundPokemon.push({
            pokemonId: mon.pokemon_id,
            distance: mon.distance_in_meters,
            footprints: 3
          })
        })
      })

      // sort by distance
      foundPokemon = foundPokemon.sort((a, b) => { return a.distance - b.distance })

      useNextAccount()
      return res.status(200).json(foundPokemon)
    })
  }

  if (!accounts[currAccIdx].authExpireDate || accounts[currAccIdx].authExpireDate.isBefore(moment())) {
    log.info('Auth expired. Logging into Pokemon Go server with account ' + accounts[currAccIdx].username)
    accounts[currAccIdx].pogo.login(accounts[currAccIdx].username, accounts[currAccIdx].password, (err, accountInfo) => {
      if (err) {
        log.error(err.stack)
        return res.status(500).send(err)
      }

      accounts[currAccIdx].authExpireDate = moment(+accountInfo.expireTs)

      queryMap()
    })
  } else {
    log.info('API token still valid, continuing with account ' + accounts[currAccIdx].username)
    queryMap()
  }
})

if (config.secure) {
  https.createServer({
    key: fs.readFileSync(config.key),
    cert: fs.readFileSync(config.cert)
  }, app).listen(8080, () => {
    log.info('PokePing server listening on 8080...')
  })
} else {
  http.createServer(app).listen(8080, () => {
    log.info('PokePing server listening on 8080...')
  })
}
