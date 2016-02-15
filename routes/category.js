var express = require('express');
var node_promise = require('node-promise')
var Category = require('../models/category.js')
var FeedParser = require('feedparser');  
var request = require('request'); 

var category = express.Router();

var node_promise = require('node-promise')


/* load configration */
var config = require("config");
var server = config.server;

var serverHost = config.server.hostname
var serverPort = config.server.port

var service = config.service;
var title = service.title

/*********************/

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
    var feedUrlRegistedCategory = []
    var feedArticleTitles = []
    var feedArticlelinks = []
    var feedArticleSummary = []
    var feedSiteName = []
    var feedSiteLink = []
    
    //ユーザの登録フィードのURLを取得する
    getFeedListInCategory = new Promise(function (resolve, reject) {
      
        // SELECT feed FROM Feed WHERE uid=uid に相当
        Category.find({'uid' : uid,'categoryname' : choosedCategory}, {'categoryname':1,'url':1,'_id':0},function(err, docs) {
          if(!err) {
            console.log('complete get feed in category')
            
            console.log("num of item => " + docs.length)

            for (var i = 0; i < docs.length; i++ ) {
                //console.log(docs[i].categoryname)
                feedUrlRegistedCategory.push(docs[i].url[i])
                //categoryUrl.push(docs[i].array)
            }
            console.log(feedUrlRegistedCategory)
            resolve(feedUrlRegistedCategory)
          }
           else{
            console.log("Category Database read error")
            reject("Category Database read error")
          }
        })
       });
       
       //取得が無事成功したら、フィードからそのサイトのタイトルを取得、表示
       getFeedListInCategory.then(function(resolve) {
           
            var entries, feedparser, feeds_test, node_promise, promisee;
            //feeds = ['http://phiary.me/rss','http://srad.jp/sradjp.rss'];
            entries = [];
    
            
            promises = feedUrlRegistedCategory.map(function(feedUrl){
    
              return new Promise(function(onFulfilled, onRejected) {
                  console.log(feedUrl)
                  try{
                    var feed_req = request(feedUrl); 
                  }catch(e){
                    console.log(e)
                  }
        
                   
                  var feedparser = new FeedParser({});
                  
                  var items = [];
                  var articleTitles = [];
                  var articleLinks = [];
                  var articleSummary = [];
                  
                  feed_req.on('error', function (error) {
                    // handle any request errors
                    console.log('Errrrrrrrrrrr')
                  });
                            
                  feed_req.on('response', function (res) {  
                    this.pipe(feedparser);
                  });
                  
                  feedparser.on('meta', function(meta) {  
                    console.log('==== %s ====', meta.title);
                    feedSiteName.push(meta.title)
                    feedSiteLink.push(meta.link)
                  });
                  
                  feedparser.on('readable', function() {  
                    while(item = this.read()) {
                      //console.log(item);
                      items.push(item);
                      articleTitles.push(item.title)
                      articleLinks.push(item.link)
                      articleSummary.push(item.summary)
                    }
                  });
                  
                  feedparser.on('end', function() {  
                    // show titles
                    //items.forEach(function(item) {
                    //  console.log('- [' + item.title + ']' + '(' + item.link + ')');
                    //});
                    feedArticleTitles.push(articleTitles)
                    feedArticlelinks.push(articleLinks)
                    feedArticleSummary.push(articleSummary)
                    onFulfilled(items);
                    
                    return items
                    
                  });
              })
              
            })

       
       
        //feedの一覧を取得した後実行される
      Promise.all(promises).then(function (d) {
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
                "title" : title,
                "feedSiteName" : feedSiteName,
                "feedSiteLink" : feedSiteLink,
                "feedArticleTitles" : feedArticleTitles,
                "feedArticlelinks" : feedArticlelinks,
                "feedArticleSummary" : feedArticleSummary,
                "categoryList"  : categoryList,
                "categoryName"  : choosedCategory
              });
         });
        
       })
       
      })
    });



module.exports = category;