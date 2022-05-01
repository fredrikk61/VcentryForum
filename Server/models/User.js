const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

const userSchema = mongoose.Schema({
    username:{
        type:String
    },
    mailID:{
        type:String
    },
    userPassword:{
        type:String
    },
    loginStatus:{
        type:String
    },
    image:{
        type:String,
        default:"https://res.cloudinary.com/fredycloud/image/upload/v1637654711/no-profile-pic_uwnx2w.jpg"
    }

})

const User = mongoose.model("User", userSchema)

module.exports = User
