//dependencies
const fs = require('fs');
const path = require('path');

const lib = {};


//base directory of the data folder
lib.basedir = path.join(__dirname,'/../.data/');

//write data to file
lib.create = function(dir,file,data,callback){
    //open file for writing
    fs.open(lib.basedir+dir+'/'+file+'.json','wx',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            const stringData = JSON.stringify(data);

            //write data to file and then close it
            fs.writeFile(fileDescriptor,stringData,function(err2){
                if(!err2){
                    fs.close(fileDescriptor,function(err3){
                        if(!err3){
                            callback(false);
                        }else{
                            callback('Error closing the new file')
                        }
                    });
                }else{
                    callback('Error writing to new file')
                }
            })
        }else{
            callback('Could not create new file,it may already exists')
        }
    })
}

//read data

lib.read = (dir,file,callback)=>{
    fs.readFile(lib.basedir+dir+'/'+file+'.json','utf-8',(err,data)=>{
        callback(err,data);
    })
}

//Upadate existing file
lib.update = (dir,file,data,callback)=>{
    //file open for writing
    fs.open(lib.basedir+dir+'/'+file+'.json','r+',(err,fileDescriptor)=>{
        if(!err && fileDescriptor){
            const stringData = JSON.stringify(data);
            //truncate the file
            fs.ftruncate(fileDescriptor,(err)=>{
                if(!err){
                    fs.writeFile(fileDescriptor,stringData,(err)=>{
                        if(!err){
                            //closing file
                            fs.close(fileDescriptor,(err)=>{
                                if(!err){
                                    callback(false);
                                }else{
                                    callback('Error closing file')
                                }
                            })
                        }else{
                            callback('Error writing to file')
                        }
                    })
                }else{
                    callback('Error truncating file');
                }
            })

        }else{
            callback('Error updating. File may not exist');
        }
    })
}

//delete
lib.delete = (dir,file,callback)=>{
    //unlink
    fs.unlink(lib.basedir+dir+'/'+file+'.json',(err)=>{
        if(!err){
            callback(false);
        }else{
            callback('Error deleting file');
        }
    })
}


lib.list = (dir,callback)=>{
    fs.readdir(lib.basedir+dir+'/',(err,fileNames)=>{
        if(!err && fileNames && fileNames.length > 0 ){
            let trimedFileNames = [];
            fileNames.forEach(fileName =>{
                trimedFileNames.push(fileName.replace('.json',''))
            })
            callback(false.valueOf,trimedFileNames);
        }else{
            callback('Error reading directory')
        }
    })
}


module.exports = lib;