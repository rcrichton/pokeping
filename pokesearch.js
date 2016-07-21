#!/usr/bin/env node
'use strict'
const request = require('request')
const geolib = require('geolib')
const moment = require('moment')

const pokemon = require('./pokemon.json')

// https://www.reddit.com/r/TheSilphRoad/comments/4s7kg5/how_much_distance_one_footstep_represents/
const footprintDist = {
  zero: 40,
  one: 75,
  two: 150,
  three: 225
}

exports.findNearbyPokemon = (lat, long, callback) => {
  request({ url: `https://crossorigin.me/https://pokevision.com/map/data/${lat}/${long}`, json: true }, (err, res, body) => {
    if (err) {
      console.log(err.stack)
      return callback(err)
    }
    if (res.statusCode !== 200) {
      console.log(`Server error ${res.statusCode}`, body)
      return callback(new Error(`Server error ${res.statusCode}: ${body}`))
    }

    let nearPokemon = body.pokemon
    let foundPokemon = []
    if (nearPokemon && nearPokemon.length > 0) {
      nearPokemon.forEach((mon) => {
        let distance = geolib.getDistance({latitude: lat, longitude: long}, {latitude: mon.latitude, longitude: mon.longitude})
        let compass = geolib.getCompassDirection({latitude: lat, longitude: long}, {latitude: mon.latitude, longitude: mon.longitude}).rough
        let footprints = 999
        if (distance < footprintDist.zero) {
          footprints = 0
        } else if (distance < footprintDist.one) {
          footprints = 1
        } else if (distance < footprintDist.two) {
          footprints = 2
        } else if (distance < footprintDist.three) {
          footprints = 3
        }
        let expireDate = moment(mon.expiration_time * 1000)
        foundPokemon.push({
          pokemonId: mon.pokemonId,
          distance: distance,
          footprints: footprints,
          expire: expireDate,
          compass: compass
        })
      })
    }

    // sort by distance
    foundPokemon = foundPokemon.sort((a, b) => { return a.distance - b.distance })

    callback(null, foundPokemon)
  })
}

const printPokemon = (lat, long) => {
  exports.findNearbyPokemon(lat, long, (err, foundPokemon) => {
    if (err) {
      return console.log(err.stack)
    }

    if (foundPokemon.length > 0) {
      console.log('Pokemon are nearby!')
      console.log('===================')
      console.log()
      console.log('Pokemon in range')
      console.log('----------------')
      foundPokemon.forEach((mon) => {
        if (mon.footprints <= 3) {
          console.log(`${pokemon[mon.pokemonId]}\tis ${mon.distance}m away\t(footprints: ${mon.footprints})\texpires ${mon.expire.fromNow()} (${mon.compass})`)
        }
      })
      console.log()
      console.log('Pokemon in the general area')
      console.log('---------------------------')
      foundPokemon.forEach((mon) => {
        if (mon.footprints > 3) {
          console.log(`${pokemon[mon.pokemonId]}\tis ${mon.distance}m away\texpires ${mon.expire.fromNow()} (${mon.compass})`)
        }
      })
      console.log()
    } else {
      console.log('No Pokemon in the area at the moment :(')
    }
  })
}

// Run as script if executed directly
if (!module.parent && process.browser !== true) {
  const lat = process.argv[2]
  const long = process.argv[3]

  console.log('Polling PokeVision once a minute...')
  printPokemon(lat, long)
  setInterval(printPokemon, 60000, lat, long)
}
