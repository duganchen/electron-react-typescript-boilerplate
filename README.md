# Electron/React/TypeScript Boilerplate

This is a boilerplate for an Electron/React/Typescript project.

It's a monorepo (thus we use Yarn) with the following structure:

* /main (the main process, with [electron-quick-start-typescript](https://github.com/electron/electron-quick-start-typescript) as its base)
* /renderer (the renderer process, created using create-react-app)

## Setting Up The Renderer Process

Create the project that will become the renderer thread:

	yarn create react-app renderer --template=typescript

In renderer/package.json, add the following:

	"homepage": "./"

Note that its name, in package.json, is "renderer".

At the top of renderer/src/App.tsx, add the following:

	const { ipcRenderer } = window.require('electron');

And at an appropriate place in the same file, add the following:
     
	<button onClick={() => { ipcRenderer.send("ping"); }}>Ping the main process</button>

## Setting Up The Main Process

Add the project that will become the main process:

	git clone https://github.com/electron/electron-quick-start-typescript.git main
	cd main
	rm -rf .git
	yarn install
	yarn add electron-is-dev
	yarn add @types/testing-library__dom
	cd ..

Note that its name is "electron-quick-start-typescript".

Make some adjustments in main/src/main.ts.

	// Add these
	import { ipcMain } from "electron";
	import * as isDev from "electron-is-dev"

	const mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true // Add this
		},
	});

	// Change the following...
	// and load the index.html of the app.
	if (isDev) {
		mainWindow.loadURL("http://localhost:5000/");
	} else {
		mainWindow.loadFile("./index.html");
	}

	// Add this
	ipcMain.on("ping", () => {
  		console.log("ping");
	});

The loadURL and loadFile calls refer to paths that we'll set up next.

## Setting Up The Monorepo

In the root package.json, add both projects as workspaces:

	"workspaces": [
	  "main",
	  "renderer"
	],

Add a script, scripts/build.sh, to build React into Electron:

	#!/usr/bin/env bash

	yarn workspace renderer build
	yarn workspace electron-quick-start-typescript build
	cp -r renderer/build/* main/dist/

Add script, scripts/start_main.sh, to wait until create-react-app's dev server is listening on its port, to start Electron:

	#!/usr/bin/env bash

	while ! echo exit | nc localhost 5000; do
	  sleep 10
	done

	yarn workspace electron-quick-start-typescript start

I've found that when we run "react-scripts start" with Foreman, its port is 5000.

Add Foreman:

	yarn add -W --dev foreman

Add a Procfile to run with Foreman:

	renderer: BROWSER=none yarn workspace renderer start
	main: ./scripts/start_main.sh

Add scripts in package.json to build and to run:

	"scripts": {
	  "start": "nf start",
	  "build": "scripts/build.sh"
	},

Then, from the root, you can start a development instance:

	yarn start

Or make a production build:

	yarn build

Click the "Ping the main process" button, and you'll see "ping" in the console.