// Athor:Rohann Nagibb Tasin

// dependencies
const http = require('http')
const https = require('https')
const { check } = require('../routes');
const data = require('./data');
const {pasrseJSON} = require('../helpers/utilities')
const url = require('url');
const {sendTwilioSms} = require('../helpers/environments')
// app object - module scafolding
const worker = {};


worker.gatherAllChecks = ()=>{
    // get all the checks
    data.list('checks',(err,checks)=>{
        if(!err && check && checks.length > 0){
            checks.forEach(check => {
                data.read('checks',check,(err,originalCHeckData)=>{
                    if(!err && originalCHeckData){
                        worker.validateCheckData(pasrseJSON(originalCHeckData));
                    }else{
                        console.log('Error : reading one of the checks data');
                    }
                })
            });
        }else{
            console.log('Error : could not find any checks to process');
        }
    })
}

worker.validateCheckData = (originalCHeckData)=>{
    if(originalCHeckData && originalCHeckData.id){
        originalCHeckData.state = typeof originalCHeckData.state === 'string' && ['up','down'].indexOf(originalCHeckData.state) > -1 ? originalCHeckData.state : down;

        originalCHeckData.lastChecked = typeof originalCHeckData.lastChecked === 'number'  && originalCHeckData.lastChecked > 0 ? originalCHeckData.lastChecked : false;

        worker.performCheck(origin)
    }else{
        console.log('Error: check was invalid or not properly formatted');
    }
}

//perform check
worker.performCheck = (originalCHeckData)=>{

    let checkOutCome = {
        'error' : false,
        'responseCode' : false
    }

    let outcomeSent = false;

    //parse the host name
    let parsedUrl = url.parse(originalCHeckData.protocol + '://' + originalCHeckData.url,true);
    let hostName = parsedUrl.hostname;
    let path = parsedUrl.path;

    //construct the request 

    const requestDetails = {
        'protocol' : originalCHeckData.protocol + ':',
        'hostname' : hostName,
        'method' : originalCHeckData.method.toUpperCase(),
        'path' : path,
        'timeout' : originalCHeckData.timeoutSeconds * 1000

    };

    const protocolToUse = originalCHeckData.protocol === 'http' ? http : https;

    let req = protocolToUse.request(requestDetails,(res)=>{
        const status = res.statusCode;

        checkOutCome.responseCode = status;
        if(!outcomeSent){
            worker.processCheckOutCome(originalCHeckData,checkOutCome);
            outcomeSent = true;
        }
    })
    
    req.on('error',e=>{
        let checkOutCome = {
            'error' : true,
            'value' : e
        }
        if(!outcomeSent){
            worker.processCheckOutCome(originalCHeckData,checkOutCome);
            outcomeSent = true;
        }
        
    })
    req.on('timeout',e=>{
        let checkOutCome = {
            'error' : true,
            'value' : 'timeout'
        }

        if(!outcomeSent){
            worker.processCheckOutCome(originalCHeckData,checkOutCome);
            outcomeSent = true;
        }

    })
    req.end();
}

worker.processCheckOutCome = (originalCHeckData,checkOutCome)=>{
    let state = !checkOutCome.error && checkOutCome.responseCode && originalCHeckData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    let alertWanted = originalCHeckData.lastChecked && originalCHeckData.state !== state ? true : false;

    let newCheckData = originalCHeckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    data.update('checks',newCheckData.id,newCheckData,(err)=>{
        if(!err){
            if(alertWanted){
                worker.alerUserToStatusChange(newCheckData);
            }else{
                console.log('Alert is nto neede as there is no state change');
            }
        }else{
            console.log('Error : trying to save check data of one of the checks');
        }
    })

}

worker.alerUserToStatusChange = (newCheckData)=>{
    let msg = `Alert : your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url}  is currently ${newCheckData.state}`
    sendTwilioSms(newCheckData.userPhone,msg,(err)=>{
        if(!err){
            console.log(`User was alerted to a status change via sms ${msg}`);
        }else{
            console.log('There was a problem sending sms to one of the users');
        }
    })
}

worker.loop = ()=>{
    setInterval(()=>{
        worker.gatherAllChecks();
    },5000)
}

//start the workers
worker.init =()=>{
    worker.gatherAllChecks();

    //call the loop
    worker.loop();
}

module.exports = worker;