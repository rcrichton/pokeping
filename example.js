#!/usr/bin/env node
'use strict'

const geolib = require('geolib')

const PoGo = require('./pokemon-go-api')

let pogo = PoGo()

// Gateway
const lat = -29.727386934052795
const long = 31.066653728485107

pogo.login('pokeping1234', 'pingpoke#123', (err, res) => {
  if (err) {
    return console.log(err)
  }
  console.log('Logged in! Here are the details', res)

  pogo.getProfile((err, profile) => {
    if (err) {
      return console.log(err)
    }
    console.log('Fetched profile info', profile)

    pogo.setLocation(lat, long)

    pogo.getMapObjects((err, mapInfo) => {
      if (err) {
        return console.log(err)
      }
      console.log('Fetched map info:')
      mapInfo.map_cells.forEach((cell) => {
        cell.catchable_pokemons.forEach((mon) => {
          let distance = geolib.getDistance({latitude: lat, longitude: long}, {latitude: mon.latitude, longitude: mon.longitude})
          let compass = geolib.getCompassDirection({latitude: lat, longitude: long}, {latitude: mon.latitude, longitude: mon.longitude}).rough
          console.log(`${mon.pokemon_id} is catchable, ${distance}m ${compass}`)
        })
        cell.wild_pokemons.forEach((mon) => {
          let distance = geolib.getDistance({latitude: lat, longitude: long}, {latitude: mon.latitude, longitude: mon.longitude})
          let compass = geolib.getCompassDirection({latitude: lat, longitude: long}, {latitude: mon.latitude, longitude: mon.longitude}).rough
          console.log(`${mon.pokemon_data.pokemon_id} is nearby, ${distance}m ${compass}`)
        })
        cell.nearby_pokemons.forEach((mon) => {
          console.log(`${mon.pokemon_id} is in the general area, ${mon.distance_in_meters}m`)
        })
      })
    })
  })
})
