var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Feed = new Schema({
  // Feed ID
  uid: {
    type: String,
  },
  feedId: {
    type: String,
    unique: true
  },
  // display name
  feedUrl: {
    type: String
  },
  feedTitle: {
    type: String
  },
  category: {
    type: String
  },
  
  //feed active flag
  feedActiveFlag: {
    type: Boolean
  }
}, { 
  // define this collection's name explicitly
  collection: "feeds"
});

module.exports = mongoose.model('Feed', Feed);