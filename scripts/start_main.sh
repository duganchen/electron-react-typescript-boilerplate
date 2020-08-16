#!/usr/bin/env bash

while ! echo exit | nc localhost 5000; do
  sleep 10
done

yarn workspace electron-quick-start-typescript start
