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
      html += '<table>'
      pokemonList.forEach(function (mon) {
        html += '<tr><td>' + pokemon[mon.pokemonId] + '\tis ' + mon.distance + 'm away\t(footprints: ' + mon.footprints + ')\texpires ' + mon.expire.fromNow() + '</td></tr>'
      })
      if (pokemonList.length < 1) {
        html += '<tr><td>No pokemon found in your area :(</td><tr>'
      }
      html += '</table>'
      element.innerHTML = html
    })
  }
}
