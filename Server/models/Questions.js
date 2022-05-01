const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

const questionSchema = mongoose.Schema({
    title:{
        type:String
    },
    content:{
        type:String
    },
    comments:[{
        text:String,
         AnsweredBy:{
             type:ObjectId,
             ref:"User"
         },
         commented_At: { type: String}   
     }],    
    answers:[{
        text:String,
        commentsForAnswers:[
            { //Need to check on this
                commentText:String,
                CommentedBy:{
                    type:ObjectId,  
                    ref:"User"
                },
                commentedForAnswers_At: { type: String}   
            }
        ],
        
         AnsweredBy:{
             type:ObjectId,
             ref:"User"
         },
        answered_At: { type: String},
        answerStatus: String
     }],
    AskedBy:{
        type:ObjectId,
        ref:"User"
    },
    created_At: { type: String}    
    
})

const Question = mongoose.model("Questions", questionSchema)

module.exports = Question
