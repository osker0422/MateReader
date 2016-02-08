var express = require('express');
var passport = require('passport');
var router = express.Router();
var async = require("async")
var co = require('co');

var app = require('../app.js')

var feedregist = require('../backend/registerRssFeed.js')

var Feed = require('../models/feed.js')
var FeedParser = require('feedparser');  
var request = require('request'); 

var Category = require('../models/category.js')

var node_promise = require('node-promise')

var title = "My"
var items = [];


/* GET index */
router.get('/', function(req, res, next) {
  console.log("GET / req.user:", req.user);
  var displayName = "Anonymous";
  var uid = "Anonymous";
  if (req.user)
    displayName = req.user.displayName,
    uid = req.user.uid;
  res.render('index', {
    title: "My RSS Reader",
    displayName: displayName,
    uid:  uid
  });
});


/* GET aothed */
router.get('/authed', ensureAuthenticated,
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
         res.render('authed', {
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

 

/* for Google OAuth link. */
router.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login']
  }),
  function(req, res) {} // this never gets called
);

/* for the callback of Google OAuth */
router.get('/oauth2callback', passport.authenticate('google', {
  successRedirect: '/authed',
  failureRedirect: '/login'
}));


/*
router.get('/authed',
  ensureAuthenticated,
  function(req, res) {
     res.render('authed', {
    title: "title",
    item : ""
  });
  }
);
*/


//get feed from form
router.post('/add_feed', function(req, res, next) {
  /*
  var feed = req.param('rss_input')
  console.log("hoge" + feed)
  var uid = req.user.uid
  */
  var feedparser = new FeedParser({});
  
  getFeed = new Promise(function (resolve, reject) {
      var feedUrl = req.param('rss_input')
      var category = req.param('categorySelect')
      console.log(req)
      console.log("hogehogehogheohgeohgoehgoehgoehgeohgohgoe")
      console.log(category)
      
      //category is not select
      if(category == ""){
        category = "no category"
      }
      else{
        var uid = req.user.uid
        var result =""
        //フィードを取得できるか試して、DBにいれる
        try {
        var feedreq = request(feedUrl);
        } catch (e) {
            result = false
        }
          
        feedreq.on('response', function (res) {  
            this.pipe(feedparser);
        });
        
        //対象RSS配布元のタイトルを表示、DBに格納する
        feedparser.on('meta', function(meta,req, res) {  
          
          var feedid = uid + meta.link
          
          //Feed用のDBに登録する
          var feed = new Feed();
          feed.feedUrl = feedUrl
          feed.feedMainUrl = meta.link
          feed.feedTitle = meta.title
          feed.uid = uid
          feed.feedActiveFlag = true
          feed.feedId = feedid
          feed.category = category
          
          feed.save(function(err) {
            if (err) { 
                reject(false)
                console.log(err); 
            }
            else{
              resolve(true)
            }
          });
          
          var categoryOnDb = []
          //category用のDBに登録する
          Category.find({'uid' : uid,'category' : category}, {'url':1,'category':1,'_id':0},function(err, docs) {
              //登録済みのcategory
              if(!err) {
                if(docs.length == 0){
                  console.log("category Error")
              
                }
                else{
                  console.log('complete get category')
                  Category.url.push(feedUrl)

                }
                
              }
              //登録されていないcategory
               else{
                console.log("category Database wrtite error")
               
              }
          })
          //console.log('====added  %s ====', meta.title);
            
            
        });
      }

  })
  
  getFeed.then(
  function(resolve){
    console.log(resolve);
    res.redirect('/authed')
    },
  function(reject){
    console.log("getFeed save Error")
    console.log(reject)
    /*
    res.redirect('/authed') // なんかエラーメッセージで投げる
    }
    */
  });
  

});




/* You can GET this page after authenticated. */
router.get('/api',
  ensureAuthenticated,
  function(req, res) {
    res.json({
      message: "You are authenticated!"
    });
  }
);

/* logout */
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// check whether authenticated or not
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
}

module.exports = router;