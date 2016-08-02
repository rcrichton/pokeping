'use strict'

const proto = require('pokemongo-protobuf')
const qs = require('querystring')
const request = require('request')
const s2 = require('s2geometry-node')
const URL = require('url')

const headers = {'User-Agent': 'Niantic App'}
const loginUrl = 'https://sso.pokemon.com/sso/login?service=https://sso.pokemon.com/sso/oauth2.0/callbackAuthorize'
const urlOauth = 'https://sso.pokemon.com/sso/oauth2.0/accessToken'

function getNeighbors (lat, lng) {
  var origin = new s2.S2CellId(new s2.S2LatLng(lat, lng)).parent(15)
  var walk = [origin.id()]
  // 10 before and 10 after
  var next = origin.next()
  var prev = origin.prev()
  for (var i = 0; i < 10; i++) {
    // in range(10):
    walk.push(prev.id())
    walk.push(next.id())
    next = next.next()
    prev = prev.prev()
  }
  return walk
}

module.exports = () => {
  let accessToken = null
  let urlRpc = 'https://pgorelease.nianticlabs.com/plfe/rpc'
  let lat = -29.727386934052795
  let long = 31.066653728485107

  return {
    login: (username, password, callback) => {
      let jar = request.jar()
      request({ url: loginUrl, json: true, headers: headers, jar: jar }, (err, res, body) => {
        if (err) {
          return callback(err)
        }

        let postBody = {
          lt: body.lt,
          execution: body.execution,
          _eventId: 'submit',
          username: username,
          password: password
        }
        request({ url: loginUrl, form: postBody, headers: headers, method: 'POST', jar: jar }, (err, res, body) => {
          if (err) {
            return callback(err)
          }
          if (!res.headers.location) {
            return callback(new Error(`Unable to login, the login server didn't return a location header (status code ${res.statusCode})`))
          }
          let ticket = URL.parse(res.headers.location, true).query.ticket

          let postBody = {
            'client_id': 'mobile-app_pokemon-go',
            'redirect_uri': 'https://www.nianticlabs.com/pokemongo/error',
            'client_secret': 'w8ScCUXJQc6kXKw8FiOhd8Fixzht18Dq3PEVkUCP5ZPxtgyWsbTvWHFLm2wNY0JR',
            'grant_type': 'refresh_token',
            'code': ticket
          }
          request({ url: urlOauth, form: postBody, headers: headers, method: 'POST', jar: true }, (err, res, body) => {
            if (err) {
              return callback(err)
            }
            accessToken = qs.parse(body).access_token

            let req = {
              request_id: 1469378659230941192,
              status_code: 2,
              latitude: lat,
              longitude: long,
              altitude: 100,
              unknown12: 989,
              auth_info: {
                provider: 'ptc',
                token: {
                  contents: accessToken,
                  unknown2: 14
                }
              },
              requests: [
                {
                  request_type: 2
                }
              ]
            }
            let reqBuf = proto.serialize(req, 'POGOProtos.Networking.Envelopes.RequestEnvelope')
            request({ url: urlRpc, method: 'POST', body: reqBuf, headers: headers, encoding: null }, (err, res, body) => {
              if (err) {
                return callback(err)
              }
              let resProto = proto.parse(body, 'POGOProtos.Networking.Envelopes.ResponseEnvelope')
              if (!resProto.api_url) {
                return callback(new Error('An api url was not returned on login'))
              }
              urlRpc = urlRpc.replace(/pgorelease\.nianticlabs\.com\/plfe(\/\d+)?/, resProto.api_url)
              return callback(null, { accessToken: accessToken, url: urlRpc, playerInfo: resProto, expireTs: resProto.auth_ticket.expire_timestamp_ms })
            })
          })
        })
      })
    },

    getProfile: (callback) => {
      let req = {
        request_id: 1469378659230941192,
        status_code: 2,
        latitude: lat,
        longitude: long,
        altitude: 100,
        unknown12: 989,
        auth_info: {
          provider: 'ptc',
          token: {
            contents: accessToken,
            unknown2: 14
          }
        },
        requests: [
          {
            request_type: 2
          },
          {
            request_type: 126
          },
          {
            request_type: 4
          },
          {
            request_type: 129
          },
          {
            request_type: 5
          }
        ]
      }
      let reqBuf = proto.serialize(req, 'POGOProtos.Networking.Envelopes.RequestEnvelope')
      request({ url: urlRpc, method: 'POST', body: reqBuf, headers: headers, encoding: null }, (err, res, body) => {
        if (err) {
          callback(err)
        }
        let resProto = proto.parse(body, 'POGOProtos.Networking.Envelopes.ResponseEnvelope')
        let player = proto.parse(resProto.returns[0], 'POGOProtos.Networking.Responses.GetPlayerResponse')
        let eggs = proto.parse(resProto.returns[1], 'POGOProtos.Networking.Responses.GetHatchedEggsResponse')
        let inventory = proto.parse(resProto.returns[2], 'POGOProtos.Networking.Responses.GetInventoryResponse')
        let badges = proto.parse(resProto.returns[3], 'POGOProtos.Networking.Responses.CheckAwardedBadgesResponse')
        let settings = proto.parse(resProto.returns[4], 'POGOProtos.Networking.Responses.DownloadSettingsResponse')
        callback(null, {
          palyer: player,
          eggs: eggs,
          inventory: inventory,
          badges: badges,
          settings: settings
        })
      })
    },

    setLocation: (latitude, longitude) => {
      lat = latitude
      long = longitude
    },

    getMapObjects: (callback) => {
      let req = {
        request_id: 1469378659230941192,
        status_code: 2,
        latitude: lat,
        longitude: long,
        altitude: 100,
        unknown12: 989,
        auth_info: {
          provider: 'ptc',
          token: {
            contents: accessToken,
            unknown2: 14
          }
        },
        requests: [
          {
            request_type: 106
          }
        ]
      }

      let walk = getNeighbors(lat, long).sort((a, b) => { return a > b })
      let nullbytes = new Array(21)
      nullbytes.fill(0)

      let reqMap = {
        cell_id: walk,
        since_timestamp_ms: nullbytes,
        latitude: lat,
        longitude: long
      }

      let mapBuf = proto.serialize(reqMap, 'POGOProtos.Networking.Requests.Messages.GetMapObjectsMessage')
      req.requests[0].request_message = mapBuf
      let reqBuf = proto.serialize(req, 'POGOProtos.Networking.Envelopes.RequestEnvelope')

      request({ url: urlRpc, method: 'POST', body: reqBuf, headers: headers, encoding: null }, (err, res, body) => {
        if (err) {
          return callback(err)
        }

        let resProto = proto.parse(body, 'POGOProtos.Networking.Envelopes.ResponseEnvelope')
        let mapInfo = proto.parse(resProto.returns[0], 'POGOProtos.Networking.Responses.GetMapObjectsResponse')
        callback(null, mapInfo)
      })
    }
  }
}
