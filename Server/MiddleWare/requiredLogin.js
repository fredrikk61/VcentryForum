const jwt = require('jsonwebtoken')
const{JWT_SecretToken} = require('../Env')
const User = require('../models/User')

const requiredLogin = (req,res,next)=>{
    const{authorization} = req.headers

    if(!authorization){
        res.status(401).json({errMsg:"Should Login First! - 1"})
    }else{
        const token = authorization.replace("Bearer ","")
        jwt.verify(token,JWT_SecretToken,(err,payload)=>{ //Should ask how it will verify both the tokens since the no. of digits get differ.
            if(err){
                res.status(401).json({errMsg:"Should Login First! - 2"})
            }else{
                const{_id} = payload
                User.findById(_id).then(userData=>{
                    // console.log(req);
                    // console.log(userData);
                    req.user = userData
                    next()
                })
            }
        })

    }

}

module.exports = requiredLogin