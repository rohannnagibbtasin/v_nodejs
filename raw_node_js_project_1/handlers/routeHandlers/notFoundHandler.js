//module scaffolding
const handler = {};
handler.notFoundHandler = (requestProperties,callback)=>{
    callback(404,{
        message : 'Your requested URL not found',
    });
};

module.exports = handler;