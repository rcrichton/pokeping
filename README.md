PokePing
========

Find Pokemon using a tracker that works!

:warning: This is an in development POC commandline tool for now. In the future we plan to create a website track Pokemon similar to how the Pokemon GO tracker is surposed to work.

To run, edit index.js with you lat long details (default is Gateway shopping center, Durban, South Africa), then:

```sh
npm install
npm start
```

This codebase uses the standard js style, stylecheck with `npm test`.

Sample output:

```
Pokemon are nearby!
===================

Pokemon in range
----------------
Rattata is 111m away    (footprints: 2) expires in 6 minutes

Pokemon in the general area
---------------------------
Golbat  is 322m away    expires in a minute
Zubat   is 419m away    expires in a minute
Pidgey  is 370m away    expires in a few seconds
Pidgey  is 575m away    expires in 2 minutes
Pidgey  is 616m away    expires in 7 minutes
Krabby  is 600m away    expires in 6 minutes
Zubat   is 633m away    expires in 7 minutes

```
