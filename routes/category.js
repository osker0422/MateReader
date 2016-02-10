var express = require('express');
var node_promise = require('node-promise')
var Category = require('../models/category.js')
var FeedParser = require('feedparser');  
var request = require('request'); 

var category = express.Router();



//get category config page
category.get('/categorys',function(req,res,next){
    console.log("User Access category page")
    var categoryList =[]
    var categoryUrl = []
    var uid = req.user.uid
    var urlinfo = require('url').parse( req.url , true );
    
    //console.log(urlinfo.query)
    //console.log(urlinfo.query.category)
    var choosedCategory = urlinfo.query.category
    
    /*
    //ユーザの登録フィードのURLを取得する
    getFeedListInCategory = new Promise(function (resolve, reject) {
      
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
             resolve(categoryList)
          }
           else{
            console.log("Category Database read error")
            reject("Category Database read error")
          }
        })
       });
       
       */
       
       /*
       //取得が無事成功したら、フィードからそのサイトのタイトルを取得、表示
       getFeedListInCategory.then(function(resolve) {
           console.log(categoryList)

            res.render('categoryconfig', {
              "title" : "title",
              "categoryList" : categoryList
              
            });
       })
       */
        var categoryList = []
         getCategorys = new Promise(function (resolve, reject) {
           // SELECT feed FROM Feed WHERE uid=uid に相当
            Category.find({'uid' : uid}, {'Url':1,'categoryname':1,'_id':0},function(err, docs) {
              if(!err) {
                console.log('complete get categorys')
                
                console.log("num of item => " + docs.length)
                for (var i = 0; i < docs.length; i++ ) {
                  categoryList.push(docs[i].categoryname);
                }
                 resolve(categoryList)
              }
               else{
                console.log("Category Database read error")
                reject("Category Database read error")
              }
            })
           
         });
         
         getCategorys.then(function(resolve){
           res.render('categorys', {
                "title" : "title",
                "categoryList"  : categoryList,
                "categoryName"  : choosedCategory
              });
         });
        

       
      })



module.exports = category;