const express = require('express')
const Question = require('../models/Questions')
const requiredLogin = require('../MiddleWare/requiredLogin')
const User = require('../models/User')
const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

const router = express.Router()

router.post('/postQuestion',requiredLogin,(req,res)=>{    
    const {title, content,Date_Time} = req.body
    const user = req.user

    if(!title){
        res.status(422).json({errMsg:"Please enter the Title"})
    }else if(!content){
        res.status(422).json({errMsg:"Please enter the Content"})
    }else{
        // console.log(user);
        // res.send("Posted Successfully")

        const qn ={
            title,
            content,
            AskedBy:user,
            created_At:Date_Time
        }

        Question.create(qn)
        .then(result=>{
            res.json({successMsg:result})
        })
        .catch(err=>{
            res.json({errMsg:err})
        })
    }
})

router.get('/allQuestions',requiredLogin,(req,res)=>{
    Question.find().sort({"title":-1}).populate('AskedBy',"username")    
    // .populate('comments.PostedBy','_id userName')
    .then(result=>{
        res.json({Questions:result})
    })
    .catch(err=>{console.log(err);})
})

router.get('/Questions/:id',requiredLogin,(req,res)=>{
    Question.findOne({_id:req.params.id})
    .select('-userPassword')
    .populate('AskedBy',"username")
    .populate('answers.AnsweredBy','_id username')
    .populate('comments.AnsweredBy','_id username')
    .populate('answers.commentsForAnswers.CommentedBy','username')
    .then(result=>{
        res.json({Question:result})
    })
    .catch(err=>{
        res.json({errMsg:err})
    })
})

router.patch('/addAnswer',requiredLogin,(req,res)=>{
    
    const qnID = req.body.qnid
    const answer = req.body.answer
    const userId = req.user._id
    const dateTime = req.body.Date_Time

    // if(!answer){
    //     res.status(422).json({errMsg:"Please enter the Answer"})
    // }

    const Answer = {
        text:answer,
        AnsweredBy:userId,
        answered_At:dateTime,
        answerStatus: "asked"
    }

    

    Question.findByIdAndUpdate(qnID, 
        {
            $push:{answers:Answer}
        },{
          new:true
      })
      .populate('AskedBy',"username")
      .populate('answers.AnsweredBy','_id username')
      .exec((err,result)=>{
          if(err){
              return res.status(422).json({errMsg:err})
          }else{
              return res.status(200).json({successMsg:result})
          }
      })

   
})

router.patch('/updateAnswer',requiredLogin,(req,res)=>{  
    const qnID = req.body.qnid  
    const answer = req.body.answer
    const answerId = req.body.answerId
    const userId = req.user._id
    const dateTime = req.body.Date_Time

    Question.updateOne(
        {
          "answers._id": answerId,
        },
        {
                "answers.$.text": answer,
                "answers.$.AnsweredBy": userId,
                "answers.$.answered_At": dateTime,
                "answers.$.answerStatus": "updated"
        },
        {
            new:true
        }
      )      
      .exec((err,result)=>{
          if(err){
              return res.status(422).json({errMsg:err})
          }else{
            
            Question.findOne({_id:qnID})
    .select('-userPassword')
    .populate('AskedBy',"username")
    .populate('answers.AnsweredBy','_id username')
    .populate('comments.AnsweredBy','_id username')
    .populate('answers.commentsForAnswers.CommentedBy','username')
    .then(result=>{
        res.json({Question:result})
    })
    .catch(err=>{
        res.json({errMsg:err})
    })
            
          }
      })

   
})

router.patch('/comments',requiredLogin,(req,res)=>{
    
    const qnID = req.body.qnid
    const comment = req.body.comment
    const userId = req.user._id
    const dateTime = req.body.Date_Time

    const Comment = {
        text:comment,
        AnsweredBy:userId,
        commented_At:dateTime
    }

    

    Question.findByIdAndUpdate(qnID, 
        {
            $push:{comments:Comment}
        },{
          new:true
      })
      .populate('AskedBy',"username")
      .populate('comments.AnsweredBy','_id username')
      .exec((err,result)=>{
          if(err){
              return res.status(422).json({errMsg:err})
          }else{
              return res.status(200).json({successMsg:result})
          }
      })

   
})

router.patch('/updateComments',requiredLogin,(req,res)=>{  
    const qnID = req.body.qnID  
    const comment = req.body.comment
    const commentId = req.body.commentID
    const userId = req.user._id
    const dateTime = req.body.Date_Time

    Question.updateOne(
        {
          "comments._id": commentId,
        },
        {
                "comments.$.text": comment,
                "comments.$.AnsweredBy": userId,
                "comments.$.commented_At": dateTime,
        },
        {
            new:true
        }
      )      
      .exec((err,result)=>{
          if(err){
              return res.status(422).json({errMsg:err})
          }else{
            
            Question.findOne({_id:qnID})
            .populate('comments.AnsweredBy','_id username')
    .then(result=>{
        res.json({Question:result})
    })
    .catch(err=>{
        res.json({errMsg:err})
    })
            
          }
      })

   
})

//Need to work on this.
router.put('/addCommentsToAnswer',requiredLogin,(req,res)=>{
    const ansID = req.body.ansID
    const dateTime = req.body.Date_Time
    const qnID = req.body.qnID    
    const comment = req.body.comment
    // const userId = req.user._id

    const Comment = {
        commentText:comment,
        CommentedBy:req.user._id,
        commentedForAnswers_At: dateTime
    }

    Question.updateOne(
        {
          "answers._id": ansID,
        },
        {
          $push: {
            "answers.$.commentsForAnswers": Comment,
          },
        },{
            new:true
        }
      ).exec((err,result)=>{
        if(err){
            return res.status(422).json({errMsg:err})
        }else{
            Question.findById(qnID,{'answers':1})
            .populate('AskedBy',"username")
            .populate('answers.AnsweredBy','_id username')
            .populate('answers.commentsForAnswers.CommentedBy','username')
            .exec((err,result)=>{res.send(result)})
        }
    })
    })


router.put('/updateCommentsToAnswer',requiredLogin,(req,res)=>{
        const ansID = req.body.ansID
        const commentID = req.body.commentID
        const dateTime = req.body.Date_Time
        const qnID = req.body.qnID    
        const comment = req.body.comment
        // const userId = req.user._id
    
        const Comment = {
            commentText:comment,
            CommentedBy:req.user._id,
            commentedForAnswers_At: dateTime
        }
        //With updateOne, the query is not working.
        Question.update(
            {qnID},
            {
                $set:{
                    "answers.$[ans].commentsForAnswers.$[cas].commentText": comment,     
                    "answers.$[ans].commentsForAnswers.$[cas].CommentedBy": req.user._id,  
                    "answers.$[ans].commentsForAnswers.$[cas].commentedForAnswers_At": dateTime,                 
                }         
            },
            { 
                "multi": false,
                "upsert": false,
                arrayFilters: [
                    {
                        "ans._id": {
                          "$eq": ansID
                        }
                      },
                      {
                        "cas._id": {
                          "$eq": commentID
                        }
                      }
                ]
              }
            // ,{
            //     new:true
            // }

          ).exec((err,result)=>{
            if(err){
                return res.status(422).json({errMsg:err})
            }else{
                Question.findById(qnID,{'answers':1})
                .populate('AskedBy',"username")
                .populate('answers.AnsweredBy','_id username')
                .populate('answers.commentsForAnswers.CommentedBy','username')
                .exec((err,result)=>{res.send(result)})
            }
        })
        })


router.get('/searchQns/:name',requiredLogin,(req,res)=>{
    // var regex = new RegExp(["^", req.params.name, "$"].join(""), "i");//to achieve case sensitive search
    if(req.params.name!==''){
        Question.find({title: { '$regex': req.params.name, '$options': 'i' }})
    // .select('-userPassword')
    .then(qns=>{
        res.status(200).json({searchedResult:qns})
        
    })
    .catch(error=>{
        res.status(404).json({errMsg:error})
    })
    }
})

router.get('/user/:id',requiredLogin,(req,res)=>{
    User.findOne({_id:req.params.id})
    .select('-userPassword')
    .then(USER=>{
        Question.find({AskedBy:req.params.id})
    .populate('AskedBy','_id username')
    .exec((err,posts)=>{
        if(err){
            return res.status(422).json({errMsg:err})
        }else{
            res.json({USER,posts})

        }
    })
        
    })
    .catch(error=>{
        res.status(404).json({errMsg:error})
    })


    
})

router.get('/myQuestions',requiredLogin ,(req,res)=>{
    User.findOne({_id:req.user.id})
    .select('-userPassword')
    .then(USER=>{
        Question.find({AskedBy:req.user.id})
    .populate('AskedBy','_id username')
    .exec((err,posts)=>{
        if(err){
            return res.status(422).json({errMsg:err})
        }else{
            res.json({USER,posts})

        }
    })
        
    })
    .catch(error=>{
        res.status(404).json({errMsg:error})
    })
})

router.delete('/deleteQuestion/:qnId',requiredLogin,(req,res)=>{
    
    Question.findOne({_id:req.params.qnId})
    .exec((err,qn)=>{
        if(err || !qn){
            return res.status(422).json({errMsg:err})    
        }else{
            
                    qn.remove().then(result=>
                        Question.find().sort({"title":-1}).populate('AskedBy',"username")    
                        // .populate('comments.PostedBy','_id userName')
                        .then(result=>{
                            res.json({Questions:result})
                        })
                        .catch(err=>{console.log(err);})
                    )
                    .catch(err=>{console.log(err);})
            
        }
    })
    
 })

 router.delete('/deleteAnswer/:ansId/:qnId',requiredLogin,(req,res)=>{
    const qnId = req.params.qnId
    Question.findByIdAndUpdate(qnId,
        {
            $pull: { answers: { _id: req.params.ansId } }  
        },{
            new:true
        })
        .populate('AskedBy',"username")
      .populate('answers.AnsweredBy','_id username')
      .exec((err,result)=>{
          if(err){
              return res.status(422).json({errMsg:err})
          }else{
            Question.findOne({_id:qnId})
            .select('-userPassword')
            .populate('AskedBy',"username")
            .populate('answers.AnsweredBy','_id username')
            .then(result=>{
                res.json({Question:result})
            })
            .catch(err=>{
                res.json({errMsg:err})
            })
          }
      })
 })

 router.delete('/deleteComment/:commentId/:qnId',requiredLogin,(req,res)=>{
    const qnId = req.params.qnId
    Question.findByIdAndUpdate(qnId,
        {
            $pull: { comments: { _id: req.params.commentId } }  
        },{
            new:true
        })
       
      .exec((err,result)=>{
          if(err){
              return res.status(422).json({errMsg:err})
          }else{
            Question.findOne({_id:qnId})
            .select('-userPassword')          
            .populate('comments.AnsweredBy','_id username')
            .then(result=>{
                res.json({Question:result})
            })
            .catch(err=>{
                res.json({errMsg:err})
            })
          }
      })
 })

 router.delete('/deleteSubComment/:ansID/:commentId/:qnId',requiredLogin,(req,res)=>{
    const qnId = req.params.qnId
    Question.update(
        {qnId},
        {
            $pull:{
                "answers.$[ans].commentsForAnswers" : { _id: req.params.commentId }
            }         
        },
        { 
            "multi": false,
            "upsert": false,
            arrayFilters: [
                {
                    "ans._id": {
                      "$eq": req.params.ansID
                    }
                  }
            ]
          }
        )
       
      .exec((err,result)=>{
          if(err){
              return res.status(422).json({errMsg:err})
          }else{
            Question.findOne({_id:qnId})
            .select('-userPassword')          
            .populate('answers.commentsForAnswers.CommentedBy','_id username')
            .populate('answers.AnsweredBy','_id username')
            .then(result=>{
                res.json({Question:result})
            })
            .catch(err=>{
                res.json({errMsg:err})
            })
          }
      })
 })

 router.delete('/deleteUser/:userid',requiredLogin,(req,res)=>{


    //1. Will Remove the User
     User.remove({"_id":req.params.userid})
     .then(result=>{
         res.json({"result":result})
     })
     .catch(error=>{
         res.json({"error":error})
     })

     //2. Will Remove the Questions he/she asked
    Question.findOne({AskedBy:req.params.userid})
    .exec((err,qn)=>{
        if(err || !qn){
            return res.status(422).json({errMsg:err})    
        }else{
            
                qn.remove().then(result=>console.log(result)).catch(err=>{console.log(err);})
            
        }
    })

    //3. Will Remove the Answers and Comments they asked.
    Question.updateMany({},{
        '$pull':{
            'comments':{'AnsweredBy':req.params.userid},
            'answers':{"AnsweredBy":req.params.userid}
        }
    },{
        new:true
    }).then(result=>{
        res.send("Questions & Comments Deleted Successfully")
    })


    // Question.updateMany({
    //     "$pull":{
    //         "comments":{
    //             "AnsweredBy":req.params.userid
    //         }
    //     }
    // },{
    //     new:true 
    // }).then(result=>{
    //     res.json().send({"result":result})
    // })
    // .catch(error=>{
    //     console.log(error);
    // })

    // Question.find({}).then(result=>{console.log(result);})

    // var cursor = Question.aggregate({$match:{_id:"622de27aa37f5b80e328c90b"}},{$group:{answers:{_id:"622de27aa37f5b80e328c90b"}}});
    // console.log(cursor.model);
    // cursor.forEach( function(comments){
    //     console.log(comments);
    // });

 })

 router.get('/allUsers',requiredLogin,(req,res)=>{
    User.find()
    // .populate('comments.PostedBy','_id userName')
    .then(result=>{
        res.json({Users:result})
    })
    .catch(err=>{console.log(err);})
})


module.exports = router