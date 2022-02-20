//module scaffolding
const environments = {};

environments.staging = {
    port : 3300,
    envName : 'staging',
    secretKey : 'uiadfhibuhduvb',
    maxChecks : 5,
    twilio : {
        fromPhone : '+19015099322',
        accountSid : 'ACcaf9c3510ab4c426637ee1afa63ffb0e',
        authToken : 'b6930b1abdc38f2d875dae28fd4dee99',
    }
}

environments.prodeuction = {
    port : 3300,
    envName : 'production',
    secretKey : 'bvjbhubbvjfbvj',
    maxChecks : 5,
    twilio : {
        fromPhone : '+19015099322',
        accountSid : 'ACcaf9c3510ab4c426637ee1afa63ffb0e',
        authToken : 'b6930b1abdc38f2d875dae28fd4dee99',
    }
}

//determine which environment was passed
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

//check corresponding environment object
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

//exporting to module
module.exports = environmentToExport;