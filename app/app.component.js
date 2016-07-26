// var Component = require('@angular/core').Component
var request = require('request')
var moment = require('moment')
var pokemon = require('../pokemon.json')

module.exports =
  ng.core.Component({
    selector: 'nearby-pokemon',
    template: `<div class="mdl-card mdl-shadow--2dp" style="width: 100%">
                <div [ngClass]="{ 'mdl-progress--indeterminate': loading }" class="mdl-progress mdl-js-progress" style="width: 100%"></div>
                <div class="mdl-card__supporting-text">
                  <table class="mdl-data-table mdl-js-data-table" style="border: 0">
                    <tr *ngIf="!nearbyPokemon || !nearbyPokemon.length || nearbyPokemon.length < 1">
                      <td class="mdl-data-table__cell--non-numeric" style="border: none">No Pokemon found nearby :(</td>
                    </tr>
                    <tr *ngFor="let mon of nearbyPokemon" class="">
                      <td class="mdl-data-table__cell--non-numeric" style="border: none">{{mon.pokemonId}}</td>
                      <td class="mdl-data-table__cell--non-numeric" style="border: none"><img *ngFor="let i of getNumber(mon.footprints)" src="img/paw.png"></td>
                      <td class="mdl-data-table__cell--non-numeric" style="border: none">{{mon.expire ? 'disappears ' + mon.expire.fromNow() : ''}}</td>
                      <td class="mdl-data-table__cell--non-numeric" style="border: none"><i *ngIf="mon.compass" class="material-icons">explore</i> {{mon.compass}}</td>
                    </tr>
                  </table>

                  <button [disabled]="loading" class="mdl-button mdl-js-button mdl-button--fab mdl-button--colored mdl-js-ripple-effect" (click)="search()">
                    <i class="material-icons">refresh</i>
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
      this.search()
    },
    search: function () {
      let self = this
      self.loading = true
      navigator.geolocation.getCurrentPosition(function findPokemon (pos) {
        self.accuracy = pos.coords.accuracy
        // hard code some active coords
        pos.coords.latitude = -29.727386934052795
        pos.coords.longitude = 31.066653728485107
        request({ url: `http://localhost:8080/pokemon/${pos.coords.latitude}/${pos.coords.longitude}`, json: true }, (err, res, pokemonList) => {
          self.loading = false
          if (err) {
            console.log(err.stack)
          }

          pokemonList.map((mon) => {
            if (mon.expire) {
              mon.expire = moment(mon.expire)
            }
            return mon
          })

          console.log(pokemonList)
          // hard code some data
          // pokemonList = [
          //   {
          //     pokemonId: '1',
          //     distance: 40,
          //     footprints: 0,
          //     expire: { fromNow: () => { return 'a minute' } },
          //     compass: 'N'
          //   },
          //   {
          //     pokemonId: '5',
          //     distance: 500,
          //     footprints: 999,
          //     expire: { fromNow: () => { return '6 minutes' } },
          //     compass: 'E'
          //   }
          // ]

          self.nearbyPokemon = pokemonList
        })
      })
    },

    getNumber: function (num) {
      console.log(num)
      return new Array(num)
    }
  })
