#!/usr/bin/env bash

yarn workspace renderer build
yarn workspace main build
cp -r renderer/build/* main/dist/
