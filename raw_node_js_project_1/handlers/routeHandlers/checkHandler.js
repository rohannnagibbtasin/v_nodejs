//dependencies
const data = require('../../lib/data');
const {hash} = require('../../helpers/utilities');
const {pasrseJSON,createRandomString} = require('../../helpers/utilities');
const { user, check } = require('../../routes');
const tokenHandler = require('./tokenHandler')
const {maxChecks} = require('../../helpers/environments');
const { update } = require('../../lib/data');
//module scaffolding
const handler = {};
handler.userHandler = (requestProperties,callback)=>{
    const acceptedMethod = ['get','post','put','delete'];
    if(acceptedMethod.indexOf(requestProperties.method)>-1){
        handler._check[requestProperties.method](requestProperties,callback)
    }else
    callback(405);
};

handler._check = {};
handler._check.post = (requestProperties,callback)=>{
    let protocol = typeof  requestProperties.body.protocol === 'string' && ['http','https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;
    let url = typeof  requestProperties.body.url === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
    let method = typeof requestProperties.body.method === 'string' && ['get','post','put','delete'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;
    let successCodes = typeof requestProperties.body.successCodes === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;
    let timeOutSeconds = typeof requestProperties.body.timeOutSeconds === 'number' && requestProperties.body.timeOutSeconds % 1  === 0 && requestProperties.body.timeOutSeconds >= 1 && requestProperties.body.timeOutSeconds <= 5  ? requestProperties.body.timeOutSeconds : false;

    if(protocol && url && method && successCodes && timeOutSeconds){
        let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
        // lookup the user phone

        data.read('tokens',token,(err,tokenData)=>{
            if(!err && tokenData){
                let userPhone = pasrseJSON(tokenData).phone;
                // look up the user data
                data.read('users',userPhone,(err,userData)=>{
                    if(!err && userData){
                        tokenHandler._token.verify(token,userPhone,(tokenValid)=>{
                            if(tokenValid){
                                let userObject = pasrseJSON(userData);
                                let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];
                                if(userChecks.length <=  maxChecks){
                                    let checkId = createRandomString(20);
                                    let checkObject = {
                                        'id' : checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeOutSeconds
                                    }
                                    
                                    data.create('checks',checkId,checkObject,(err)=>{
                                        if(!err){
                                            //add check id to the user's object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            data.update('users',userPhone,userObject,(err)=>{
                                                if(!err){
                                                    callback(200,checkObject)
                                                }else{
                                                    callback(500,{
                                                        'error' : 'There is a problem in server side'
                                                    })
                                                }
                                            })
                                        }else{
                                            callback(500,{
                                                'error' : 'There is a problem in server side'
                                            })
                                        }
                                    })
                                }else{
                                    callback(401,{
                                        error : 'User has already reached max check limit'
                                    })
                                }
                            }else{
                                callback(403,{
                                    'error' : "Authentication problem"
                                })
                            }
                        })
                    }else{
                        callback(403),{
                            'error':'User not found'
                        }
                    }
                })
            }else{
                callback(403,{
                    'error' : "Authentication problem"
                })
            }
        })
    }else{
        callback(400,{
            error : 'You have a problem in your request'
        })
    }


}

handler._check.get = (requestProperties,callback)=>{
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if(id){
        data.read('checks',id,(err,checkData)=>{
            if(!err && checkData){
                let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
                tokenHandler._token.verify(token,pasrseJSON(checkData).userPhone,(tokenValid)=>{
                    if(tokenValid){
                        callback(200,pasrseJSON(checkData))
                    }else{
                        callback(403,{
                            'error' : 'Authentication error'
                        })
                    }
                })
            }else{
                callback(400,{
                    'error' : 'There is problem in your in request'
                })
            }
        })
    }else{
        callback(400,{
            'error' : 'There is problem in your in request'
        })
    }
}

handler._check.put = (requestProperties, callback) =>{
    const id =
        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;
    let protocol = typeof  requestProperties.body.protocol === 'string' && ['http','https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;
    let url = typeof  requestProperties.body.url === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
    let method = typeof requestProperties.body.method === 'string' && ['get','post','put','delete'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;
    let successCodes = typeof requestProperties.body.successCodes === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;
    let timeOutSeconds = typeof requestProperties.body.timeOutSeconds === 'number' && requestProperties.body.timeOutSeconds % 1  === 0 && requestProperties.body.timeOutSeconds >= 1 && requestProperties.body.timeOutSeconds <= 5  ? requestProperties.body.timeOutSeconds : false;
    if(id){
        if(protocol || url  || method || successCodes || timeOutSeconds){
            data.read('checks',id,(err,checkData)=>{
                if(!err && checkData){
                    let checkObject = pasrseJSON(checkData)
                    let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
                    tokenHandler._token.verify(token,checkObject.userPhone,(tokenValid)=>{
                        if(tokenValid){
                            if(protocol){
                                checkObject.protocol = protocol;
                            }
                            if(url){
                                checkObject.url = url;
                            }
                            if(method){
                                checkObject.method = method;
                            }
                            if(successCodes){
                                checkObject.successCodes = successCodes;
                            }
                            if(timeOutSeconds){
                                checkObject.timeOutSeconds = timeOutSeconds;
                            }

                            data.update('checks',id,checkObject,(err)=>{
                                if(!err){
                                    callback(200)
                                }else{
                                    callback(500,{
                                        error : 'There was a problem in server side'
                                    })
                                }
                            })

                        }else{403,{
                            error :'Authentication error'
                        }}
                    })
                }else{
                    callback(500,{
                        error : 'There was a problem in server side'
                    })
                }
            })
        }else{
            callback(400,{
                error :'You must provide at least one field'
            })
        }
    }else{
        callback(400,{
            'error' : 'There is problem in your in request'
        })
    }
}

handler._check.delete = (requestProperties, callback) =>{
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if(id){
        data.read('checks',id,(err,checkData)=>{
            if(!err && checkData){
                let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
                tokenHandler._token.verify(token,pasrseJSON(checkData).userPhone,(tokenValid)=>{
                    if(tokenValid){
                        //delete the check data
                        data.delete('checks',id,(err)=>{
                            if(!err){
                                data.read('users',pasrseJSON(checkData).userPhone,(err,userData)=>{
                                    let userObject = pasrseJSON(userData);
                                    if(!err && userData){
                                        let userChecks = typeof userObject.checks === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                        //remove the deleted check id form user's list of checks

                                        let checkPostion = userChecks.indexOf(id);
                                        if(checkPostion > -1){
                                            userChecks.splice(checkPostion,1);

                                            userObject.checks = userChecks;

                                            data.update('users',userObject.phone,userObject,(err)=>{
                                                if(err){
                                                    callback(200);
                                                }else{
                                                    callback(500,{
                                                        error : 'There was a server side error'
                                                    })
                                                }
                                            })
                                        }else{
                                            callback(500,{
                                                error : 'The check id that you are trying to remove is not found in user'
                                            })
                                        }
                                    }else{
                                        callback(500,{
                                            error : 'There was a server side error'
                                        })
                                    }
                                })
                            }else{
                                callback(500,{
                                    error : 'There was a server side error'
                                })
                            }
                        })
                    }else{
                        callback(403,{
                            'error' : 'Authentication error'
                        })
                    }
                })
            }else{
                callback(400,{
                    'error' : 'There is problem in your in request'
                })
            }
        })
    }else{
        callback(400,{
            'error' : 'There is problem in your in request'
        })
    }
}

module.exports = handler;