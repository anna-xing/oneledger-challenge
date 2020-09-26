import React from "react";
import "./App.css";

import Card from "./components";

const {
  yourMasterKeyPassword,
  keyType,
  keyIndex,
  publicKey,
  encryptedMasterKeySeed,
  env,
  createWallet,
  createAccount,
  requestTestOLT,
  addPartTx,
  queryPart,
  queryBalanceForAddr,
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
