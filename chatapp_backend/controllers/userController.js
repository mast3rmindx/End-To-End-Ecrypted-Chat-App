const express = require('express')
var router = express.Router()
const mongoose = require('mongoose');
var nodemailer = require('nodemailer');

const User = mongoose.model('user');
const OTP = mongoose.model('otp');


router.post('/getotp',async (req, res) => {
    if(/\S+@\S+\.\S+/.test(req.body.email)&&/^\d{3}$/.test(req.body.phone_num)){
        console.log(req.body.email)
        console.log(req.body.phone_num)
        var otp = await generateOTP(req.body.email)
        if(await insertUserMongod(req.body.name,req.body.email,req.body.phone_num,otp))
            res.json({'message': "New person added", 'type': "success"});
        else
            res.json({'message': "Database error", 'type': "error"});
      // dbc=="m"?insertUserMongod(req.body.email,req.body.phone_num,otp):insertUserCass(req.body.email,req.body.phone_num,otp);
    }else{
      res.json({"error":"Incorrect details"});
    }
  })//Step 1: pass name,email,number & receive otp


async function insertUserMongod(name,email,phone_num,otp){
   var newUser = new User()
   newUser.name = name
   newUser.email = email
   newUser.number = phone_num

   var newOTP = new OTP()
   newOTP.email = email
   newOTP.otp = otp
   newOTP.otp_check = false

   var result=true;
   await newUser.save(function(err, User){
    if(err){
        result = false
        console.log(err)
    }
    else{
        result = true
        console.log(result)
    }
    });
    await newOTP.save(function(err, User){
        if(err){
            result = false
            console.log(err)
        }
        else{
            result = true
            console.log(result)
        }
        });
    console.log(result+"res")
    return result
}


async function generateOTP(email) { 
    let OTP = 0; 
    var d=1
    for (let i = 0; i < 4; i++ ) { 
        OTP = OTP*10 + Math.floor(Math.random() * 10); 
    } 

    var transporter = await nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'askrparikh@gmail.com',
          pass: 'Imgonnamakeit'
        }
      });
      
      var mailOptions = {
        from: 'askrparikh@gmail.com',
        to: email,
        subject: 'OTP for ChatApp',
        text: ('Your OTP is '+OTP)
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      }); 
      return OTP; 
} 

router.post("/verifyotp",async (req,res) => {
  if(/^\d{4}$/.test(req.body.otp)&&/\S+@\S+\.\S+/.test(req.body.email)){
    console.log(req.body.otp)
    console.log(req.body.email)
    console.log(req.body.password)
    if(await checkOTP(req.body.otp,req.body.email)){
        if(register(req.body.password,req.body.email)){
            console.log(" status : "+"Success")
            res.json({"status":"Success"})
        }else{
            console.log(" status : "+"Error")
            res.json({"status":"Registration Failed"})
        }
    }
    else{
        console.log(" status : "+"Retry")
      res.json({"status":"Retry"})
    }
  }
})//Step 2: pass otp,email & receive confirmation for otp also password

async function checkOTP(otp,email_id) {
    var result = true
    var id = await OTP.find({email:email_id},["otp","otp_check"],
    function(err, response){
        if(!err){
            console.log("Retrieve Response check : "+response); 
            if(response!=null){
                if(response[0]['otp_check']){
                    result=false     
                }    
            }
        }else{
            console.log("Error"+err)
            result=false
        }
    });
    if(otp==id[0].otp&&result!=false){
        await OTP.findByIdAndUpdate(id[0]._id, {otp_check: true}, function(err, response){
            if(!err){
                console.log("Retrieve Response update : "+response);
                if(response==null){
                    result=false
                }
            }else{
                console.log("Error : "+err)
                result=false
            }
        });
    }
    
    console.log(" result : "+result)
    return result;
}

router.post("/register", (req,res) =>{
  if(req.body.pass!=null && /^\d{3}$/.test(req.body.phone_num)){
    console.log(req.body.email)
    console.log(req.body.pass)
    if(register(req.body.pass,req.body.pass)){
        res.json({"status":"Registered"})
    }
    else{
      res.json({"status":"Technical Error"})
    }
  }else{
    res.json({"status":"Syntax Error"})
  }
})//Step 3:Register by passing password along with number

function register(pass,email_id){
    var result = true
    User.updateOne({email:email_id}, {pass: pass}, function(err, response){
        if(!err){
            console.log("Retrieve Response : "+response);
            if(response==null){
                result=false
            }
        }else{
            console.log("Error : "+err)
            result=false
        }
    });
    return result;
}

module.exports = router 