//local
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/chatApp', {useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true},
err =>{
    if(!err){
        console.log("Connected successfully to Mongod server")
    }else{
        console.log("Error : "+err)
    }
})

require('./user.js');
require('./chat.js')
require('./schedule.js')
require('./call.js')
require('./otp.js')
