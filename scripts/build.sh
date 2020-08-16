#!/usr/bin/env bash

yarn workspace renderer build
yarn workspace electron-quick-start-typescript build
cp -r renderer/build/* main/dist/
