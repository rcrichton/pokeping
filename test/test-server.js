const http = require('http')
const moment = require('moment')

http.createServer((req, res) => {
  res.writeHead(200, { 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify([
    {
      pokemonId: 'ZUBAT',
      distance: 20,
      footprints: 0,
      expire: moment().add(1, 'minute').toDate(),
      compass: 'N'
    },
    {
      pokemonId: 'CLEFAIRY',
      distance: 100,
      footprints: 2,
      expire: moment().add(3, 'minute').toDate(),
      compass: 'E'
    },
    {
      pokemonId: 'VAPOREON',
      distance: 200,
      footprints: 3
    },
    {
      pokemonId: 'NIDORAN_FEMALE',
      distance: 200,
      footprints: 3
    }
  ]))
}).listen(8080, () => {
  console.log('Test server listening on 8080...')
})
