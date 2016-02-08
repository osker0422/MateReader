var express = require('express');
var node_promise = require('node-promise')
var Category = require('../models/category.js')
var FeedParser = require('feedparser');  
var request = require('request'); 

var config = express.Router();



//get category config page
config.get('/categoryconfig',function(req,res,next){
    console.log("User Access categoryconfig")
    var categoryList =[]
    var categoryUrl = []
    var uid = req.user.uid
    //ユーザの登録フィードのURLを取得する
    getCategoryList = new Promise(function (resolve, reject) {
      
        // SELECT feed FROM Feed WHERE uid=uid に相当
        Category.find({'uid' : uid}, {'categoryname':1,'_id':0},function(err, docs) {
          if(!err) {
            console.log('complete get feeds')
            
            console.log("num of item => " + docs.length)
            for (var i = 0; i < docs.length; i++ ) {
                console.log(docs[i].categoryname)
                categoryList.push(docs[i].categoryname)
                //categoryUrl.push(docs[i].array)
            }

             resolve()
          }
           else{
            console.log("Category Database read error")
            reject("Category Database read error")
          }
        })
       });

       //取得が無事成功したら、フィードからそのサイトのタイトルを取得、表示
       getCategoryList.then(function(resolve) {
           console.log(categoryList)

            res.render('categoryconfig', {
              "title" : "title",
              "category" : categoryList
            });
       })
})


config.post('/add_category',function(req,res,next){
    console.log("User Access categoryconfig")
    
    var categoryName = req.param('add_category')
    var uid = req.user.uid
    
    addCategory = new Promise(function (resolve, reject) {
        
        var category = new Category()
        
        category.categoryname = categoryName
        category.uid = uid
        category.categoryid = categoryName + uid
        
        category.save(function(err) {
          if (err) { 
              reject(false)
              console.log(err); 
          }
          else{
            resolve(true)
          }
        });
       });

       //取得が無事成功したら、フィードからそのサイトのタイトルを取得、表示
     addCategory.then(function(resolve) {


            res.redirect('categoryconfig')
 
       })
})




module.exports = config;