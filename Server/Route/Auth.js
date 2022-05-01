const express = require('express')
const user = require('../models/User')
const router = express.Router()

const{JWT_SecretToken} = require('../Env')
const jwt = require('jsonwebtoken')
const requiredLogin = require('../MiddleWare/requiredLogin')

// const requiredLogin = require('../MiddleWare/requiredLogin')


// router.get('/safeLogin',requiredLogin,(req,res)=>{
//     res.send("Logged in with token")
// })



router.post('/signup',(req,res)=>{
    const {name,email,pwd} = req.body

    if(!name || !email || !pwd){
        res.status(422).json({errMsg:"Please Enter all Fields!"})
    }else{
        user.findOne({mailID:email}).then(isExistingUser=>{
            if(isExistingUser){
                res.status(422).json({errMsg:"User Already Exists"})
            }else{

                const userRecord={
                    username:name,
                    mailID:email,
                    userPassword:pwd,
                    loginStatus:"Not Approved"     
                }

                user.create(userRecord).then(()=>{
                    res.status(200).json({successMessage:"You have been successfully registered.Please wait for the admin approval"})
                })
                .catch(err=>{console.log(err);})

            }
        })
    }
})

router.post('/signin',(req,res)=>{
    const{email,pwd} = req.body

    if(!email || !pwd){
        console.log(email,pwd);
        res.status(422).json({errMsg:"Enter all fields"})
    }else{
        user.findOne({mailID:email}).then(existingUser=>{
            if(existingUser){                
                
                if(pwd === existingUser.userPassword){
                    if(existingUser.loginStatus==="Approved"){
                        const token = jwt.sign({_id:existingUser._id},JWT_SecretToken)
                        const {_id,mailID,username} = existingUser
                        // res.cookie('token',token).send()
                        res.status(200).json({successMessage:"Login Success!",token:token,user:{id:_id,mail:mailID,name:username}})   
                    }else if(existingUser.loginStatus==="Not Approved"){                    
                        res.status(422).json({errMsg:"You are not approved yet! "})
                    }
                    else if(existingUser.loginStatus==="Banned"){
                        res.status(422).json({errMsg:"You are Banned from this site. Please contact Admin for further details ! "})
                    }                        
                }else{
                    res.status(422).json({errMsg:"Invalid Password"})
                }
            }else{
                res.status(422).json({errMsg:"Invalid Email"})
            }
        })
    }
})

router.patch('/updateStatus/:status/:id',(req,res)=>{
    let id =req.params.id
    let updatedValue = req.params.status
    user.findByIdAndUpdate(id, {loginStatus:updatedValue},{
        new:true
    }).then(result=>{
        user.find()
    // .populate('comments.PostedBy','_id userName')
    .then(result=>{
        res.json({Users:result})
    })
    .catch(err=>{console.log(err);})
    })   
})

router.patch('/updateProfile',requiredLogin,(req,res)=>{
    let {name, mail} =req.body

    if(!mail){
        user.findByIdAndUpdate(req.user.id, {username:name},{
            new:true
        }).then(result=>{
            res.send(result)
        }).catch(err=>{
            res.send(err)
        })
        
    }else if(!name){
        user.findByIdAndUpdate(req.user.id, {mailID:mail},{
            new:true
        }).then(result=>{
            res.send(result)
        }).catch(err=>{
            res.send(err)
        })
    }else{
        user.findByIdAndUpdate(req.user.id, {username:name ,mailID:mail},{
            new:true
        }).then(result=>{
            res.send(result)
        }).catch(err=>{
            res.send(err)
        })
    }
})

router.put('/profilepicupdate',requiredLogin,(req,res)=>{
    // console.log("Follower Id---",req.body.image);
    user.findByIdAndUpdate(req.user._id,{
        $set:{image:req.body.image}
    },{
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({errMsg:err})
        }

    }).then(result=>{console.log(result);})
    .catch(error=>{console.log(error);})
})

// router.get('/profile',(req,res)=>{
//     const token = req.cookies.token;
//     jwt.verify(token,JWT_SecretToken,(err,data)=>{
//         if(err){
//             res.status(403).json({'err':err}).send();
//         }else{
//             res.json(data).send();
//         }
//     })
// })



module.exports = router