const {request} = require('ons-SDK');

async function queryPart({vin, partType}, env) {
    const params = {
        VIN: vin,
        'Part Type': partType
    };

    const method = "vpart_query.GetVPart";
    const result = await request.queryCustom(method, params, env).catch(error => {
        return Promise.reject(error);
    });

    return Promise.resolve(result);
}

module.exports = {
    queryPart
}
