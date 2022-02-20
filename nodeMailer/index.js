const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth:{
        user: 'tanviranjum10801080@gmail.com',
        pass: '01787594911'
    }
})
let msg = {
    from: '"Tanvir Anjum" <tanviranjum10801080@gmail.com>',
    to: 'rntasin@gmail.com',
    subject: "First",
    text: "How are you",
};

transporter.sendMail(msg,(err,info)=>{
    if(err){
        console.log(err);
    }else{
        console.log(`Sent ${info.response}`);
    }
});