'use strict'

// var Component = require('@angular/core').Component
var request = require('request')
var moment = require('moment')
var pokemon = require('../pokemon.json')
const config = require('../config.json')

module.exports =
  ng.core.Component({
    selector: 'nearby-pokemon',
    template: `<div class="mdl-card mdl-shadow--2dp" style="width: 100%">
                <div [ngClass]="{ 'mdl-progress--indeterminate': loading }" class="mdl-progress mdl-js-progress" style="width: 100%"></div>
                <div class="mdl-card__supporting-text">
                  <div class="row">
                    <div *ngIf="!nearbyPokemon || !nearbyPokemon.length || nearbyPokemon.length < 1" class="mdl-list__item">
                      <span>{{errorText}}</span>
                    </div>
                    <div *ngFor="let mon of nearbyPokemon" class="col-xs-4" style="height: 150px">
                      <div class="pkm pkm{{pokemon[mon.pokemonId]}} mini img-responsive center-block"></div>
                      <div align="center" style="height: 20px">
                        <img *ngFor="let i of getNumber(mon.footprints)" src="img/track.png" width="20px" height="20px">
                      </div>
                      <div style="height: 40px" class="text-center">{{mon.expire ? 'Disappears ' + mon.expire.fromNow() : ''}}<span *ngIf="mon.compass">, head {{mon.compass}}</span></div>
                    </div>
                  </div>

                  <button [disabled]="loading || cooldown" class="mdl-button mdl-js-button mdl-button--fab mdl-button--colored mdl-js-ripple-effect" (click)="search()">
                    <i *ngIf="!cooldown" class="material-icons">refresh</i>
                    <span *ngIf="cooldown">{{cooldownSeconds}}</span>
                  </button>
                  <div>Location accuracy is {{accuracy}}m</div>
                </div>
              </div>`
  })
  .Class({
    constructor: function () {
      this.pokemon = pokemon
      this.loading = false
      this.nearbyPokemon = []
      this.accuracy = '???'
      this.errorText = 'Loading nearby pokémon...'
      this.search()
    },
    search: function () {
      let self = this
      self.loading = true
      self.cooldown = false
      self.cooldownSeconds = 0

      const startCooldown = (seconds) => {
        self.cooldown = true
        self.cooldownSeconds = seconds
        let interval = setInterval(() => {
          self.cooldownSeconds--
          if (self.cooldownSeconds === 0) {
            clearInterval(interval)
            self.cooldown = false
          }
        }, 1000)
      }

      navigator.geolocation.getCurrentPosition(function findPokemon (pos) {
        self.accuracy = pos.coords.accuracy
        request({ url: `${config.serverUrl}/${pos.coords.latitude}/${pos.coords.longitude}`, json: true }, (err, res, pokemonList) => {
          if (err || res.statusCode === 500) {
            if (err) {
              console.log(`Something went wrong fetching the pokemon list: ${err.stack}`)
            } else {
              console.log(`Something went wrong fetching the pokemon list: Recieved a 500 response with body ${JSON.stringify(pokemonList)}`)
            }
            self.errorText = 'Something went wrong fetching data from the game server, please try again...'
            self.nearbyPokemon = []
            self.loading = false
            return
          }

          if (pokemonList && pokemonList.length > 0) {
            pokemonList.map((mon) => {
              if (mon.expire) {
                mon.expire = moment(mon.expire)
              }
              return mon
            })
            self.nearbyPokemon = pokemonList
            startCooldown(15)
          } else {
            self.errorText = ':( There are no Pokemon nearby right now or PokePing is being rate limited by the Pokemon Go servers'
            self.nearbyPokemon = []
          }
          self.loading = false
        })
      })
    },

    getNumber: function (num) {
      return new Array(num)
    }
  }, { enableHighAccuracy: true })
