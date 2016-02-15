var express = require('express');
var node_promise = require('node-promise')
var Feed = require('../models/feed.js')
var Category = require('../models/category.js')
var FeedParser = require('feedparser');  
var request = require('request'); 

var feedconfig = express.Router();

/* load configration */
var config = require("config");
var server = config.server;

var serverHost = config.server.hostname
var serverPort = config.server.port

var service = config.service;
var title = service.title

/*********************/

feedconfig.get('/feedconfig',function(req, res){
    
    console.log("User Access feedconfig")
    var feedSiteName =[]
    var feedSiteLink =[]
    var getUrl = []
    var getTitle = []
    var uid = req.user.uid
    //ユーザの登録フィードのURLを取得する
    getFeedList = new Promise(function (resolve, reject) {
      
        // SELECT feed FROM Feed WHERE uid=uid に相当
        Feed.find({'uid' : uid}, {'feedUrl':1,'feedTitle':1,'_id':0},function(err, docs) {
          if(!err) {
            console.log('complete get feeds')
            
            console.log("num of item => " + docs.length)
            for (var i = 0; i < docs.length; i++ ) {
              getUrl.push(docs[i].feedUrl);
              getTitle.push(docs[i].feedTitle);
            }
            console.log(getUrl)
            console.log(getTitle)
             resolve(getUrl)
          }
           else{
            console.log("Feed Database read error")
            reject("Feed Database read error")
          }
        })
       });
       

       //取得が無事成功したら、フィードからそのサイトのタイトルを取得、表示
       getFeedList.then(function(resolve) {
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
           res.render('feedconfig', {
                "title" : title,
                "feedSiteName" : feedSiteName,
                "feedSiteLink" : feedSiteLink,
                "feedSiteName" : getTitle,
                "feedSiteLink" : getUrl,
                "categoryList"  : categoryList
              });
         });

       })
        
    //res.render('feedconfig')
});

//get feed remobe buttom
feedconfig.post('/feed_remove',function(req,res,next){
    var uid = req.user.uid
    console.log("feedconfig.get feed_remove")
    var removeTargetFeed = req.param('feed_remove')
    console.log(removeTargetFeed)
    
     //removeを押されたFeedを特定して削除する
    removeFeed = new Promise(function (resolve, reject) {
      
        // SELECT feed FROM Feed WHERE uid=uid に相当
        Feed.remove({'uid' : uid,'feedUrl' : removeTargetFeed},function(err) {
          if(!err) {
            console.log('deleated feedUrl')
             resolve(true)
          }
           else{
            console.log("Feed Database delete error")
            reject("Feed Database read error")
          }
        })
       });

   //取得が無事成功したら、フィードからそのサイトのタイトルを取得、表示
   removeFeed.then(function(resolve) {
        res.redirect('/feedconfig')
   })
    
})
    
module.exports = feedconfig;