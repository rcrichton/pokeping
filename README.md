PokePing
========

Find Pokemon using a tracker that works!

:warning: This is an in development POC tool for now. In the future we plan to create a website track Pokemon similar to how the Pokemon GO tracker is supposed to work.

To run:

```sh
sudo apt-get install libprotobuf-dev build-essential pkg-config
npm install
npm start
```

Then, access the url that is displayed.

To run as a commandline tool:

```sh
npm start -- <lat> <long> # where lat and long are decimals
npm start -- -29.725933492868684 31.06720089912414
```

This codebase uses the standard js style, stylecheck with `npm test`.
