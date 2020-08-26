#!/usr/bin/env bash

export REACT_PORT=${REACT_PORT:-5000}

while ! echo exit | nc localhost "$REACT_PORT"; do
  sleep 10
done

while :
do
  yarn workspace main debug
done
