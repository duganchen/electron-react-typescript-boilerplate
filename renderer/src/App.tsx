import React from "react";
import logo from "./logo.svg";
import "./App.css";
const { ipcRenderer } = window.require("electron");

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <p>
        <button
          onClick={() => {
            console.log("breakpoint");
            ipcRenderer.send("ping");
          }}
        >
          Ping the main process
        </button>
      </p>
    </div>
  );
}

export default App;
