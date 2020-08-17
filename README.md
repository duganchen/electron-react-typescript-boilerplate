# Electron/React/TypeScript Boilerplate

This is a boilerplate for an Electron/React/Typescript project.

It's a monorepo (thus we use Yarn) with the following structure:

* /main (the main process, with [electron-quick-start-typescript](https://github.com/electron/electron-quick-start-typescript) as its base)
* /renderer (the renderer process, created using create-react-app)

I'm going to write a bit about how to recreate this.

## Setting Up The Renderer Process

Create the project that will become the renderer process:

	yarn create react-app renderer --template=typescript

In react/package.json, add the following:

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
	rm -rf .git package-lock.json
	yarn install
	yarn add electron-is-dev
	yarn add --dev @types/testing-library__dom
	cd ..

Note that its name, in package.json, is "electron-quick-start-typescript". Change it to "main".

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
		mainWindow.loadURL("http://localhost:3000/");
	} else {
		mainWindow.loadFile(path.join(__dirname, "index.html"));
	}

	// Add this
	ipcMain.on("ping", () => {
  		console.log("ping");
	});

	// Delete this so that it doesn't interfere with VSCode's debugger.
	// mainWindow.webContents.openDevTools();

The loadURL call loads CRA's dev server; the loadFile call loads a path we'll set up next.

In its tsconfig.json file, add the following under "compilerOptions" (it's needed to get VSCode's debugger to work properly with Async/Await):

	"target": "ESNext",

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

Add a "script" in package.json to run it:

	"scripts": {
	  "build": "scripts/build.sh"
	},

Now, when you want to build React into Electron (not needed for when you're just developing), you can do:
	
	yarn run build

## Testing

Start the React server:
	
	BROWSER=none yarn workspace renderer start

When it's serving on port 3000, start Electron:

	yarn workspace main start

Click the "Ping the main process" button, and you'll see "ping" in the console. That confirms that the main (Electron) and renderer (React) processes are communicating properly.

You've have live-reloading in the renderer process because it's being served by react-scripts. To see changes in the main process, restart electron.

## Setting Up VSCode Debugging

Here's your workflow going forward. You keep the React server running in the background (probably in its own terminal), you open the root of the monorepo as a workspace in VSCode, and you use VSCode to debug both the main and renderer processes.

Install VSCode's [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) extension if you haven't already.

I also recommend the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extensions: again, if you don't already have them.

In the monorepo's root, add .vscode/launch.json:

	{
	  "version": "0.2.0",
	  "configurations": [
	    {
	      "name": "Debug Main Process",
	      "type": "node",
	      "request": "launch",
	      "cwd": "${workspaceFolder}",
	      "runtimeExecutable": "yarn",
	      "runtimeArgs": ["workspace", "main", "run", "start"],
	      "outputCapture": "std"
	    },
	    {
	      "name": "Debug Renderer Process",
	      "type": "chrome",
	      "request": "launch",
	      "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron",
	      "runtimeArgs": [
		"${workspaceFolder}/main/dist/main.js",
		"--remote-debugging-port=9222"
	      ],
	      "webRoot": "${workspaceRoot}"
	    }
	  ]
	}

Set breakpoints in the Typescript files, and use "Debug Main Process" and "Debug Render Process" to step through the main and render processes, respectively.

## Credits

I'm not going to list every blog I looked at for this, but these two stand out.

Thank you to the following blog entry, for help with setting up debugging for the renderer process: [Debug Electron App with VS Code
](https://blog.matsu.io/debug-electron-vscode)

And this one, for the "homepage" tip in particular: [Building an Electron application with create-react-app](https://www.freecodecamp.org/news/building-an-electron-application-with-create-react-app-97945861647c/)
