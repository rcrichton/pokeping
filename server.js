'use strict'

const cors = require('cors')
const express = require('express')
const fs = require('fs')
const geolib = require('geolib')
const http = require('http')
const https = require('https')
const moment = require('moment')

const config = require('./config.json')
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

app.get('/pokemon/:lat/:long', (req, res) => {
  console.log(`GET ${req.url}`)
  const pogo = PoGo()
  pogo.login('pokeping1234', 'pingpoke#123', (err) => {
    if (err) {
      console.log(err.stack)
      return res.status(500).send(err)
    }

    let lat = parseFloat(req.params.lat)
    let long = parseFloat(req.params.long)

    pogo.setLocation(lat, long)

    pogo.getMapObjects((err, mapInfo) => {
      if (err) {
        console.log(err.stack)
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

      return res.status(200).json(foundPokemon)
    })
  })
})

if (config.secure) {
  https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  }, app).listen(8080, () => {
    console.log('PokePing server listening on 8080...')
  })
} else {
  http.createServer(app).listen(8080, () => {
    console.log('PokePing server listening on 8080...')
  })
}
