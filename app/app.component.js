// var Component = require('@angular/core').Component
var pokesearch = require('../pokesearch')
var pokemon = require('../pokemon.json')

module.exports =
  ng.core.Component({
    selector: 'nearby-pokemon',
    template: `<div class="mdl-card mdl-shadow--2dp" style="width: 100%">
                <div [ngClass]="{ 'mdl-progress--indeterminate': loading }" class="mdl-progress mdl-js-progress" style="width: 100%"></div>
                <div class="mdl-card__supporting-text">
                  <ul class="mdl-list">
                    <li *ngIf="!nearbyPokemon || !nearbyPokemon.length || nearbyPokemon.length < 1">
                      <span class="mdl-list__item-primary-content">
                        No Pokemon found nearby :(
                      </span>
                    </li>
                    <li *ngFor="let mon of nearbyPokemon" class="mdl-list__item">
                      <span class="mdl-list__item-primary-content">
                        {{pokemon[mon.pokemonId]}} is {{mon.distance}}m away and disappears in {{mon.expire.fromNow()}} <i class="material-icons">explore</i> {{mon.compass}}
                      </span>
                    </li>
                  </ul>

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
      navigator.geolocation.getCurrentPosition(findPokemon)
      function findPokemon (pos) {
        self.accuracy = pos.coords.accuracy
        pokesearch.findNearbyPokemon(pos.coords.latitude, pos.coords.longitude, function (err, pokemonList) {
          self.loading = false
          if (err) {
            console.log(err.stack)
          }

          // hard code some data
          pokemonList = [
            {
              pokemonId: '1',
              distance: 40,
              footprints: 0,
              expire: { fromNow: () => { return 'a minute' } },
              compass: 'N'
            },
            {
              pokemonId: '5',
              distance: 500,
              footprints: 999,
              expire: { fromNow: () => { return '6 minutes' } },
              compass: 'E'
            }
          ]

          self.nearbyPokemon = pokemonList
        })
      }
    }
  })
