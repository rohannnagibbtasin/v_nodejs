// Athor:Rohann Nagibb Tasin

// dependencies
const http = require('http');
const {handleReqRes} = require('../helpers/hadleReqRes');
const environment = require('../helpers/environments')

// app object - module scafolding
const server = {};

// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes)
    createServerVariable.listen(environment.port, () => {
        console.log(`listening to port ${environment.port}`);
    });
};

// handle Request Response
server.handleReqRes = handleReqRes;

//start the server
server.init =()=>{
    server.createServer();
}

module.exports = server;