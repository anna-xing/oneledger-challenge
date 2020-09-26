import React from 'react';
import './App.css';

// Predefined Oneledger transaction stuff -----------------------

const yourMasterKeyPassword = "5h$mY_SupEr_sTRong_%$passWorD123#@"; 
// ^ password to encrypt/decrypt your HD wallet master key
const fullnodeUrl = "https://comm-test-fn1.devnet.oneledger.network/jsonrpc" 
// fullnode URL is used to broadcast transactions and make queries
const faucetServerUrl = "https://comm-test-faucet.devnet.oneledger.network/jsonrpc"; 
// faucet server URL is used to request Test OLT

// 1. Create HD Wallet

const HDVault = require('hd-vault');
const mnemonicWords = HDVault.mnemonicUtil.mnemonicGenerator24();
const masterKey = new HDVault.MasterKeySeedManager(mnemonicWords, yourMasterKeyPassword);
const {encryptedMasterKeySeed} = masterKey.getMasterKeySeedInfo();

// 2. Create Oneledger Account

const derivedKeyData = {
	keyType: "OLT",
	keyIndex: 0, // Increment keyIndex for generating new keys
	password: yourMasterKeyPassword,
	encryptedMasterKeySeed: encryptedMasterKeySeed 
}; 

async function getResponse() {
	return await HDVault.derivedKeyManager.deriveNewKeyPair(derivedKeyData).catch(error => {
		throw(error);
	});
}

const response = getResponse();
const {keyIndex, address, publicKey} = response;

// 3. Request Test OLT

const requestAmount = 10000;
const faucet = require('ons-faucet');
const env = {url: faucetServerUrl};
async function getTestResponse() {
	return await faucet.requestOLT(address, requestAmount, env).catch(error => {
		throw(error);
	});
}

const result = getTestResponse();

// ----------------------------

function App() {
	return (
		<div className="App">
		<h1>OneLedger Challenge for BorderHacks!</h1>
		<p>Test test</p>
		</div>
	);
}

export default App;
