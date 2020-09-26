import React from "react";
import "./App.css";

import Card from "./components";

const {
  yourMasterKeyPassword,
  fullnodeUrl,
  faucetServerUrl,
  keyType,
  keyIndex,
  env,
  createWallet,
  createAccount,
  requestTestOLT,
  addPartTx,
  queryPart,
  queryAccount,
  sign,
  broadcastTx,
} = require("./blockchain/index");

function App() {
  return (
    <div className="App">
      <h1>OneLedger Challenge for BorderHacks!</h1>
      <Card title="Hello!!" />
    </div>
  );
}

export default App;
