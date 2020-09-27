// REQUIRES: {publicKey, rawTx, signature}, env
// RETURNS: txHash -- BROADCASTBODY

async function broadcastTx({publicKey, rawTx, signature}, env) {
    const {request, requestConfig} = require('ons-SDK');

    const broadcastBody = {
        broadcastType: requestConfig.BroadcastType.Sync,
        rawTx: rawTx,
        signature: signature,
        publicKey: {
            keyType: requestConfig.PublicKeyTypes.publicKeyType,
            data: publicKey
        }
    };
    return broadcastBody; // code below returns strange errors...
    /*
    const { response } = await request.broadcastTx(broadcastBody, env).catch(error => {
        throw error;
    });

    const {txHash, height} = response;
    return txHash;
    */
}

module.exports = broadcastTx;
