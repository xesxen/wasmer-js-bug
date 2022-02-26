#!/bin/sh
wasmer run --mapdir /tmp:./tmp --mapdir /share:./share --mapdir /data:./static static/nextpnr-ice40.wasm -- --up5k --package sg48 --asc /blinky.asc --pcf /data/upduino_v2.pcf --json /data/input.json
