var pokesearch = require('./pokesearch')
var pokemon = require('./pokemon.json')

window.search = function () {
  var element = document.getElementById('pokemon')

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(findPokemon)
  } else {
    element.innerHTML = 'Geolocation is not supported by this browser.'
  }

  function findPokemon (pos) {
    pokesearch.findNearbyPokemon(pos.coords.latitude, pos.coords.longitude, function (err, pokemonList) {
      if (err) {
        console.log(err.stack)
      }
      var html = ''
      html += '<ul class="mdl-list">'
      pokemonList.forEach(function (mon) {
        if (mon.footprints > 3) {
          html += '<li class="mdl-list__item"><span class="mdl-list__item-primary-content">' + pokemon[mon.pokemonId] + '\tis ' + mon.distance + 'm away\t\texpires ' + mon.expire.fromNow() + ', direction: ' + mon.compass + '</li>'
        } else {
          html += '<li class="mdl-list__item"><span class="mdl-list__item-primary-content">' + pokemon[mon.pokemonId] + '\tis ' + mon.distance + 'm away\t(footprints: ' + mon.footprints + ')\texpires ' + mon.expire.fromNow() + ', direction: ' + mon.compass + '</li>'
        }
      })
      if (pokemonList.length < 1) {
        html += '<li class="mdl-list__item"><span class="mdl-list__item-primary-content">No pokemon found in your area :(</li>'
      }
      html += '<li class="mdl-list__item"><span class="mdl-list__item-primary-content">Your location accuracy: ' + pos.coords.accuracy + 'm</li>'
      html += '</ul>\n'
      element.innerHTML = html
    })
  }
}
