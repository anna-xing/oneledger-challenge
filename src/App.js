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

async function test() {
  // wallet + account creation
  const emks = await createWallet(yourMasterKeyPassword);
  const { i, address, publicKey } = await createAccount(yourMasterKeyPassword, emks);
  console.log(address);

  // request test olt
  let response = await requestTestOLT(address);
  console.log(response);
  console.log("done requesting test olt");

  setTimeout(async () => {
    // query acc balance
    let balance = await queryAccount({ address }, env);
    console.log(balance);

    // adding a part
    const newPart = await addPartTx(
      {
        vin: "1D4HR48N73F526307",
        partType: "engine",
        dealerName: "John",
        dealerAddress: "9 Apple St",
        stockNum: "N8990ABCD",
        year: 2008,
        operator: address,
      },
      env
    );
    console.log(newPart);

    // signing + broadcasting
    const signature = await sign(newPart.data, emks);
    console.log(signature);
    const txHash = await broadcastTx({
      publicKey: publicKey, 
      rawTx: newPart.data, 
      signature: signature
    }, env);
    console.log(txHash)
  }, 15000);
}

function App() {
  test();
  return (
    <div className="App">
      <p>testing line, remove later</p>
    </div>
  );
}

export default App;
