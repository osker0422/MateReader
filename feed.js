/*
 * feed.js
 */

var FeedParser = require('feedparser');  
var request = require('request');  
var feeds = ['http://phiary.me/rss','http://srad.jp/sradjp.rss'];
//var feed = 'http://hogehogekonoaho.com/';
var Step = require('step');
var async = require('async');
 
var feedparser = new FeedParser({});

var items = [];

var promises;

promises = feeds.map(function(url) {
  var promise = new Promise(function (resolve, reject) {
    var req = request(url);
    req.on('response', function (res) {  
      this.pipe(feedparser);
    });
    
    resolve(42);
    
  });
});



/*

async.forEach(feed, function(feedurl, cb) {

        var req = request(feedurl); 
        req.on('error', function (error) {
          // handle any request errors
          console.log('Errrrrrrrrrrr')
        });

    
        req.on('response', function (res) {  
          console.log("sss")
          this.pipe(feedparser);
        });
        feedparser.on('readable', function() {  
          console.log("sss")
          while(item = this.read()) {
            //console.log(item);
            items.push(item);
          }
        });
        // show titles
        items.forEach(function(item) {
          console.log('- [' + item.title + ']' + '(' + item.link + ')');
        });
        
        console.log(items)
        
  
}, function() {
  console.log('fin');
});

/*
async.forEachSeries([1, 2, 3], function(val, cb) {
  setTimeout(function() {
    console.log(val);
    cb();
  }, 1 / val * 1000);
}, function() {
  console.log('fin');
});
*/

/*

req.on('error', function (error) {
  // handle any request errors
  console.log('Errrrrrrrrrrr')
});

req.on('response', function (res) {  
  this.pipe(feedparser);
});

//対象RSS配布元のタイトルを表示する
feedparser.on('meta', function(meta) {  
  console.log('==== %s ====', meta.title);
});

feedparser.on('readable', function() {  
  while(item = this.read()) {
    //console.log(item);
    items.push(item);
  }
});

//Feedの取得が終了次第実行
feedparser.on('end', function() {  
  // show titles
  items.forEach(function(item) {
    console.log('- [' + item.title + ']' + '(' + item.link + ')');
  });
});

*/


/*
 * feed.js
 */

var FeedParser = require('feedparser');  
var request = require('request');  
var feed = 'http://phiary.me/rss';

var req = request(feed);  
var feedparser = new FeedParser({});

var items = [];

req.on('response', function (res) {  
  this.pipe(feedparser);
});

feedparser.on('meta', function(meta) {  
  console.log('==== %s ====', meta.title);
});

feedparser.on('readable', function() {  
  while(item = this.read()) {
    // console.log(item);
    items.push(item);
  }
});

feedparser.on('end', function() {  
  // show titles
  items.forEach(function(item) {
    console.log('- [' + item.title + ']' + '(' + item.link + ')');
  });
});