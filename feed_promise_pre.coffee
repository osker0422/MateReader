feedparser = require('feedparser');
request = require('request');
node_promise = require('node-promise');

feeds = [ "http://some.feed", "http://other.feed" ];

entries = []
promises = feeds.map (url) ->
  deferred = node_promise.defer()
  request(url)
    .pipe(new feedparser [])
    .on('error', console.log.bind console)
    .on('data', entries.push.bind entries)
    .on('end', deferred.resolve.bind deferred)
  deferred.promise

node_promise.when (node_promise.all promises), () ->
  entries.forEach (entry) ->
