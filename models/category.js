var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Category = new Schema({
  // Feed ID
  uid: {
    type: String,
  },
  // category's feedurl
  url: {
    type: Array
  },
  categoryname: {
    type: String
  },
  
  //feed active flag
  categoryid: {
    type: String
  }
}, { 
  // define this collection's name explicitly
  collection: "categorys"
});

module.exports = mongoose.model('Category', Category);