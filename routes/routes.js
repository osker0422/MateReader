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

/* load configration */
var config = require("config");
var server = config.server;

var serverHost = config.server.hostname
var serverPort = config.server.port

var service = config.service;
var title = service.title

/*********************/

/* GET index */
router.get('/', function(req, res, next) {
  console.log("GET / req.user:", req.user);
  var displayName = "Anonymous";
  var uid = "Anonymous";
  if (req.user)
    displayName = req.user.displayName,
    uid = req.user.uid;
  res.render('index', {
    title: title,
    displayName: displayName,
    uid:  uid
  });
});


 

/* for Google OAuth link. */
router.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login']
  }),
  function(req, res) {} // this never gets called
);

/* for the callback of Google OAuth */
router.get('/oauth2callback', passport.authenticate('google', {
  successRedirect: '/splash',
  failureRedirect: '/login'
}));


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
      /*
      var category = req.param('categorySelect')

      //category is not select
      if(category == ""){
        category = "nocategory"
        //reject(category)
      }
      */
      var category;
      if (req.param('categorySelect') == ""){
        category = req.param('categorySelect')
      }
      else{
        category = "nocategory"
      }
   //   else{
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
          chkCategoryList = new Promise(function (resolve, reject) {
            var categorychkflag = true
            Category.find({'uid' : uid,'categoryname' : category},{'url':1},function(err,docs){
              if(!err)
              for (var i = 0; i < docs.length; i++ ) {
                if(docs[i].url == feedUrl){
                  categorychkflag = false
                }
              }
              resolve(categorychkflag)
            })

          })
          
          
          chkCategoryList.then(function (resolve) {
            if(resolve == true){
              Category.update({'uid' : uid,'categoryname' : category}, {$push: {url:feedUrl}},function(err, numberAffected, raw) {
                //登録済みのcategory
                if(!err) {
                  console.log("complete update category database")
                }
                //登録されていないcategory
                 else{
                  console.log("category Database wrtite error")
                 
                }
             })
              
            }
            else{
              console.log("this url is already added")
            }

  
          })
            
        });
      //}

  })
  
  getFeed.then(
  function(resolve){
    console.log(resolve);
    res.redirect('/splash')
    },
  function(reject){
    console.log("getFeed save Error")
    console.log(reject)
    var error_msg = reject
    res.redirect('splash');
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