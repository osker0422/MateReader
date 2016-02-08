//認証後のメインページ
var express = require('express');
var passport = require('passport');
var FeedParser = require('feedparser');  
var request = require('request'); 
var splash = express.Router();

var app = require('../app.js')
var route = require("./routes.js")

//models
var Feed = require('../models/feed.js')
var Category = require('../models/category.js')

var node_promise = require('node-promise')

var title = "My"
var items = [];



/* GET aothed */
splash.get('/splash', ensureAuthenticated,
function(req, res, next) {
  console.log("GET /feedregist req.param:", req.param('rss_input'));
  
  var feed = "Anonymous";
  var items = []
  var uid = req.user.uid
  
  /*debug mess*/
  console.log("======== router get authed debugmess ========")
  console.log(uid)
  console.log(req.user.displayName)
  console.log("======== router get authed debugmess end ========")
  
  var getUrl = [];
          
  var feedArticleTitles = []
  var feedArticlelinks = []
  var feedArticleSummary = []
  var feedSiteName = []
  var feedSiteLink = []
  
  //ユーザの登録フィードのURLを取得する
   getUserFeed = new Promise(function (resolve, reject) {
  
    // SELECT feed FROM Feed WHERE uid=uid に相当
    Feed.find({'uid' : uid}, {'feedUrl':1,'_id':0},function(err, docs) {
      if(!err) {
        console.log('complete get feeds')
        
        console.log("num of item => " + docs.length)
        for (var i = 0; i < docs.length; i++ ) {
          getUrl.push(docs[i].feedUrl);
        }
         resolve(getUrl)
      }
       else{
        console.log("Feed Database read error")
        reject("Feed Database read error")
      }
    })
   });
   //取得が無事成功したら、フィードから更新情報を取得して表示
   getUserFeed.then(function(resolve) {
       
   
        //resolve(getUrl)
        var entries, feedparser, feeds_test, node_promise, promisee;
        //feeds = ['http://phiary.me/rss','http://srad.jp/sradjp.rss'];
        feeds = getUrl;
        entries = [];

        
        promises = feeds.map(function(feedUrl){

          return new Promise(function(onFulfilled, onRejected) {
          console.log(feedUrl)
          try{
            var feed_req = request(feedUrl); 
          }catch(e){
            console.log(e)
            console.log("ho")
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

      Promise.all(promises).then(function (d) {
         res.render('splash', {
              "title" : title,
              "feedSiteName" : feedSiteName,
              "feedSiteLink" : feedSiteLink,
              "feedArticleTitles" : feedArticleTitles,
              "feedArticlelinks" : feedArticlelinks,
              "feedArticleSummary" : feedArticleSummary
            });
       
      })
      })
      
})

// check whether authenticated or not
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
}


module.exports = splash;