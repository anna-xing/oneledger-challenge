# Oneledger Faucet
For Testnet only

## Usage

1. CLI 
    ```bash
    $ node add_olt.js 0lt1234567890123456789012345678901234567890 1 - 10000 faucet_server_url
    ```
    `faucet_server_url` is optional, it is pointing to `Chronos` network by default if not given.

2. npm dependency 
    ```javascript 1.8
    const faucet = require('ons-faucet'); 
    
   const env = {url: faucet_server_url};
    const {response} = await faucet.requestOLT(address, amount, env).catch(error => {
        // handle error here  
    });
    const result = response
    ```



