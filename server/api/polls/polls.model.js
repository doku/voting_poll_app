'use strict';



/*
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var ThingSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Thing', ThingSchema);

*/


/*
                    user_name: d.name,
                    poll_name: c,
                    poll_options: b.pollOptions,
                    poll_results: f,
                    votes: [],
                    voted_users: [],
                    comments: []
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
var PollSchema = new Schema({
    user_name: String,
    poll_name: String,
    poll_options: Array,
    poll_results: Array,
    votes: Array,
    voted_users: Array,
    comments: Array
    
});
module.exports = mongoose.model('Polls', PollSchema);



/*

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ThingSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Poll', ThingSchema);

*/