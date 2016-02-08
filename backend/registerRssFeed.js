var Feed = require('../models/feed.js')
var FeedParser = require('feedparser');  
var request = require('request'); 
var co = require("co");

var items = [];

module.exports = {
    
    addDataBase : function(feedUrl,uid){
        
            var feedparser = new FeedParser({});
            //フィードを取得できるか試して、DBにいれる
            try {
            var feedreq = request(feedUrl);
             	
            } catch (e) {
                return false
            }
              
            feedreq.on('response', function (res) {  
                this.pipe(feedparser);
            });
            co(function () {
            //対象RSS配布元のタイトルを表示、DBに格納する
            feedparser.on('meta', function(meta,req, res) {  
                
                var feed = new Feed();
                feed.url = meta.link
                feed.title = meta.title
                feed.uid = uid
                feed.feedActiveFlag = true
                
                feed.save(function(err) {
                  if (err) { 
                      console.log("mogeeeeeeeeeeeeee")
                      console.log(err); 
                      return false
                  }
                  
                });
                console.log('====added  %s ====', meta.title);
               
                
            })
           
            
            return true
        });
        
    },
    
    getFeed : function(feedUrl,uid){
        console.log("aaaaaaaaaaaaaaaaaaaaaaaa")
        
    }
};