# Electron/React/TypeScript Boilerplate

This is a boilerplate for an Electron/React/Typescript project.

To start it, enter "yarn start". That gives you the following:

- the React is served with react-scripts, and has live reload
- Electron's debugging port is open, and ready to be attached to by VSCode
- There is a "Restart" menu item to restart the main process (and pick up code changes)

I'm going to write a bit about how to recreate this.

## The Monorepo Structure

It's a monorepo (thus we use Yarn) with the following structure:

- /main (the main process, with [electron-quick-start-typescript](https://github.com/electron/electron-quick-start-typescript) as its base)
- /renderer (the renderer process, created using create-react-app)

Each has its own package.json file. The contents of the root of the repo are responsible for coordinating them.

## Setting Up The Renderer Process

Create the project that will become the renderer process:

    yarn create react-app renderer --template=typescript
    yarn workspace renderer add --dev eslint

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
    yarn add dotenv
    yarn add --dev @types/testing-library__dom
    yarn add --dev eslint
    cd ..

Note that its name, in package.json, is "electron-quick-start-typescript". Change it to "main".

And the following, under "scripts", in package.json:

    "debug": "electron ./dist/main.js -remote-debugging-port=9222"

Make some adjustments in main/src/main.ts.

    // Add these
    import { ipcMain } from "electron";
    import * as isDev from "electron-is-dev";
    import { config } from "dotenv";
    config();

    // ...

    const mainWindow = new BrowserWindow({
      webPreferences: {
    	  nodeIntegration: true // Add this
    	},
    });

    // ...

    // Add this to the "ready" handler:
    if (process.env.DEVTOOLS) {
      await session.defaultSession.loadExtension(process.env.DEVTOOLS);
    }

    // ...

    // Change the following...
    if (isDev) {

      const menu = Menu.getApplicationMenu();
      menu.append(new MenuItem({ label: "Restart", click: () => app.exit(3) }));
      Menu.setApplicationMenu(menu);

      const reactPort =
        process.env.REACT_PORT !== undefined ? process.env.REACT_PORT : "3000";
      mainWindow.loadURL(`http://localhost:${reactPort}/`);
    } else {
      mainWindow.loadFile("./index.html");
    }

    // ...

    // Add this
    ipcMain.on("ping", () => {
      console.log("ping");
    });

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
    yarn workspace main build
    cp -r renderer/build/* main/dist/

Add script, scripts/start_main.sh, to wait until create-react-app's dev server is listening on its port, to start Electron:

    #!/usr/bin/env bash

    export REACT_PORT=${REACT_PORT:-5000}

    while ! echo exit | nc localhost "$REACT_PORT"; do
      sleep 10
    done

    STATUS="3"
    while [[ "$STATUS" == "3" ]]
    do
      yarn workspace main debug
      # The exit code is 0 if you quit, 3 if you restart
      STATUS="$?"
    done

I've found that when we run "react-scripts start" with Foreman, its port is 5000.

Add Foreman:

    yarn add -W --dev foreman

Add a Procfile to run with Foreman:

    renderer: BROWSER=none yarn workspace renderer start
    watch: yarn workspace main watch
    main: ./scripts/start_main.sh

Add scripts in package.json to build and to run the project:

    "scripts": {
      "start": "nf start",
      "build": "scripts/build.sh"
    },

Then, from the root, you can start a development instance:

    yarn start

Or make a production build:

    yarn build

And start it:

    ELECTRON_IS_DEV=0 yarn workspace main run start

## Testing

To test, just start it like this:

    yarn start

You have hot reload for the React app because it's being served with React Scripts. To restart Electron, quit it; it will restart automatically, and pick up any changes you've made to the main process' source code.

Click the "Ping the main process" button, and you'll see "ping" in the console. That confirms that the main (Electron) and renderer (React) processes are communicating properly.

## Setting Up VSCode Debugging

Here's your workflow going forward. You keep "yarn start" running in the background (probably in its own terminal), you open the root of the monorepo as a workspace in VSCode, and you use VSCode to debug both the main and renderer processes.

Install VSCode's [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) extension if you haven't already.

I also recommend the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extensions: again, if you don't already have them.

To install the React Developer Tools, look up [DevTools Extension](https://www.electronjs.org/docs/tutorial/devtools-extension) to see how to get the path to the extension. Then put the following in main/.env:

    DEVTOOLS=/path/to/react-developer-tools

In the monorepo's root, add .vscode/launch.json:

    {
      "version": "0.2.0",
      "configurations": [
        {
          "name": "Attach to Chrome",
          "type": "chrome",
          "request": "attach",
          "port": 9222,
          "webRoot": "${workspaceRoot}",
          "sourceMaps": true
        }
      ]
    }

In VSCode, set a breakpoint. Select the "Attach to Chrome" configuration and, well, attach to Chrome (Electron). In Electron, press Cmd-R to reload. Use the application until VSCode hits the breakpoint.

## Credits

I'm not going to list every blog I looked at for this, but these two stand out.

Thank you to the following blog entry, for help with setting up debugging for the renderer process: [Debug Electron App with VS Code
](https://blog.matsu.io/debug-electron-vscode)

And this one, for the "homepage" tip in particular: [Building an Electron application with create-react-app](https://www.freecodecamp.org/news/building-an-electron-application-with-create-react-app-97945861647c/)
