PokePing
========

Find Pokemon using a tracker that works! Visit [PokePing.net](https://pokeping.net).

<img src="http://i.imgur.com/gVzSh4c.png" width="400">

To run your own, you will need your own accounts.json file in the root directory with form `[{username: 'xxx', password:'yyy'}]`. You can add as many account as you like to improve queries per second on the server. The server will round-robin between accounts.

To install and run:

```sh
sudo apt-get install libprotobuf-dev build-essential pkg-config
npm install
npm start
```

Then, access the url that is displayed.

This codebase uses the standard js style, stylecheck with `npm test`.

Thanks
------

I used, borrowed code and referenced some of the following repos during development of this app. I really apreciate the effort they have put in. I wouldn't have gotten this far without building off their work.

* https://github.com/AeonLucid/POGOProtos
* https://github.com/Armax/Pokemon-GO-node-api
* https://github.com/Mila432/Pokemon_Go_API
* https://github.com/AHAAAAAAA/PokemonGo-Map
