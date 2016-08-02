PokePing
========

Find Pokemon using a tracker that works! Visit [PokePing.net](https://pokeping.net).

To run your own, you will need your own accounts.json file in the root directory with form `[{username: 'xxx', password:'yyy'}]`. You can add as many account as you like to improve queries per second on the server. The server will round-robin between accounts.

To install and run:

```sh
sudo apt-get install libprotobuf-dev build-essential pkg-config
npm install
npm start
```

Then, access the url that is displayed.

This codebase uses the standard js style, stylecheck with `npm test`.
