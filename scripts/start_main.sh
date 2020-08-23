#!/usr/bin/env bash

export REACT_PORT=${REACT_PORT:-5000}

while ! echo exit | nc localhost "$REACT_PORT"; do
  sleep 10
done

STATUS="3"
while [[ "$STATUS" == "3" ]]
do
  yarn workspace main build
  yarn workspace main debug
  # The exit code is 0 if you quit, 3 if you restart
  STATUS="$?"
done
