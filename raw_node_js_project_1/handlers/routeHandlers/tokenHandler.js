//dependencies
const data = require('../../lib/data');
const {hash} = require('../../helpers/utilities');
const {createRandomString} = require('../../helpers/utilities');
const { token } = require('../../routes');
const {pasrseJSON} = require('../../helpers/utilities');
// const { user } = require('../../routes');

//module scaffolding
const handler = {};
handler.tokenHandler = (requestProperties,callback)=>{
    const acceptedMethod = ['get','post','put','delete'];
    if(acceptedMethod.indexOf(requestProperties.method)>-1){
        handler._token[requestProperties.method](requestProperties,callback)
    }else
    callback(405);
};

handler._token = {};
handler._token.post = (requestProperties,callback)=>{
    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;
    if(phone && password){
        data.read('users',phone,(err,userData)=>{
            let hashedPassword = hash(password);
            if(hashedPassword === pasrseJSON(userData).password){
                let tokenId = createRandomString(20);
                let expires = Date.now() + 60 * 60 * 1000;
                let tokenObject = {
                    phone,
                    'id':tokenId,
                    expires
                }
                data.create('tokens',tokenId,tokenObject,(err)=>{
                    if(!err){
                        callback(200,tokenObject);
                    }else{
                        callback(500,{
                            error : 'There was a problem in the server side'
                        })
                    }
                })
            }else{
                callback(400,{
                    error : 'Password is not valid'
                })
            }
        })
    }else{
        callback(400,{
            error : 'You have a problem in your request'
        })
    }
}

handler._token.get = (requestProperties,callback)=>{
    //check the id if valid
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if(id){
        data.read('tokens',id,(err,tokenData)=>{
            const token = {...pasrseJSON(tokenData)};
            if(!err && token){
                callback(200,token)
            }else{
                callback(404,{
                    'error':'Requested token was not found'
                })
            }
        })
    }else{
        callback(404,{
            'error':'Requested token was not found'
        })
    }
}

handler._token.put = (requestProperties,callback)=>{
    const id =
        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;
    const extend =
        typeof requestProperties.body.extend === 'boolean' &&
        requestProperties.body.extend === true
            ? true
            : false;
    if(id && extend){
        data.read('tokens',id,(err,tokenData)=>{
            let tokenObject = pasrseJSON(tokenData)
            if(tokenObject.expires > Date.now()){
                tokenObject.expires = Date.now() + 60 * 60 * 1000;

                data.update('tokens',id,tokenObject,(err)=>{
                    if(!err){
                        callback(200)
                    }else{
                        callback(500,{
                            'error' : 'There was a server side problem '
                        })
                    }
                })
            }else{
                callback(404,{
                    'error' : 'Token already expired'
                })
            }
        })
    }else{
        callback(404,{
            'error':'You have a problem in your request'
        })
    }
}

handler._token.delete = (requestProperties,callback)=>{
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if(id){
        data.read('tokens',id,(err,tokenData)=>{
            if(!err && tokenData){
                data.delete('token',id,(err)=>{
                    if(!err){
                        callback(200,{
                            'message':'Token was succcessfully deleted'
                        })
                    }else{
                        callback(500,{
                            'error':'There was a problem in server side'
                        })
                    }
                })
            }else{
                callback(500,{
                    'error':'There was a problem in server side'
                })
            }
        })
    }else{
        callback(400,{
            'error':'There was a problem in your request'
        })
    }
}


handler._token.verify = (id,phone,callback)=>{
    data.read('tokens',id,(err,tokenData)=>{
        if(!err && tokenData){
            if(pasrseJSON(tokenData).phone === phone && pasrseJSON(tokenData).expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false)
        }
    })
}

module.exports = handler;