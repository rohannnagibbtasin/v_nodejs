const crypto = require('crypto');
const environments = require('./environments');
//module scaffolding
const utilities = {};

utilities.pasrseJSON = (jsonString)=>{
    let output;
    try{
        output = JSON.parse(jsonString);
    }catch{
        output = {};
    }
    return output;
}

//hash string
utilities.hash = (str)=>{
    if(typeof str === 'string' && str.length >0){
        const hash = crypto
            .createHmac('sha256',environments.secretKey)
            .update(str)
            .digest('hex');
        return hash;
    }else{
        return false;
    }
}

//create random string 

utilities.createRandomString = (strlenght)=>{
    let length = strlenght;
    length = typeof strlenght === 'number' && strlenght>0 ? strlenght : false;
    if(length){
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';
        for(let i=1;i<=length;i++){
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            output += randomCharacter;
        }
        return output;
    }else{
        return false;
    }
}

//exporting to module
module.exports = utilities;