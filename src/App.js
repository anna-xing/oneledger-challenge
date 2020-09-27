import React from "react";
import "./App.css";

const {
  yourMasterKeyPassword,
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
  let temp = await createWallet(yourMasterKeyPassword);
  const emks = temp.encryptedMasterKeySeed;
  const { i, address, publicKey } = await createAccount(
    yourMasterKeyPassword,
    emks
  );
  console.log(address);
  console.log("pk - " + publicKey);

  // request test olt
  let response = await requestTestOLT(address);
  console.log(response);
  console.log("done requesting test olt");

  setTimeout(async () => {
    // query acc balance
    let balance = await queryAccount({ address }, env);
    console.log(balance);

    // adding a part
    const rawTx = await addPartTx(
      {
        vin: "1D4HR48N73F526307",
        partType: "engine",
        dealerName: "John",
        dealerAddress: "9 Apple St",
        stockNum: "aaaaaaaaa",
        year: 2008,
        operator: address,
      },
      env
    );
    console.log(rawTx);

    // signing
    const signature = await sign(rawTx, emks);
    console.log("sig: " + signature);

    // broadcasting
    const txHash = await broadcastTx(
      {
        publicKey: publicKey,
        rawTx: rawTx,
        signature: signature,
      },
      env
    );
    console.log(txHash);

    // querying blockchain
    const result = await queryPart(
      {
        VIN: "1D4HR48N73F526307",
        "Part Type": "engine",
      },
      env
    );
    console.log(result);
  }, 3000); // increase delay if querying acc balance
}

function App() {
  test();
  return <div className="App"></div>;
}

export default App;
