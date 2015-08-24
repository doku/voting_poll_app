/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 * 
 * GET      /polls/:username/:pollname      -> show: check exist return len 0 if true
 * POST     /POLLS/                         -> create: submit polls
 * GET      /polls/:username/all            -> list polls for user
 * PUT      /polls/:id                      -> vote on poll
 * GET      /polls/:id                      -> delete
 * 
 */

'use strict';





var _ = require('lodash');
var Poll = require('./polls.model');

// Get list of things
exports.index = function(req, res) {
  Poll.find({user_name: req.params.name }, function (err, polls) {
    if(err) { return handleError(res, err); }
    //console.log(polls);
    return res.status(200).json(polls);
  });
};

// Get a single thing
exports.show = function(req, res) {
    
    //console.log(req.params.name);
    Poll.find({user_name: req.params.name, poll_name:req.params.poll_name}, function (err, polls) {
        if(err) { return handleError(res.err);}
        //console.log(res.json(polls));
        if(!polls) { return "" }
        return res.json(polls);
        
    });  
    
    /*
  Poll.findById(req.params.id, function (err, polls) {
    if(err) { return handleError(res, err); }
    if(!polls) { return res.status(200).json({"test":1}); }
    return res.status(200).json(polls);
  });
  */
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  Poll.create(req.body, function(err, polls) {
    if(err) { return handleError(res, err); }
    console.log(polls);
    return res.status(200).json(polls);
  });
};

exports.vote = function(req, res){
  if(req.body._id) { delete req.body._id; }
  Poll.findById(req.params.id, function (err, poll) {
    if (err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    
    console.log(req.body);
    
    poll.poll_results = req.body.poll_results;
    poll.save(function(err){
        if (err) { return handleError(res, err); }
        return res.status(200).json(poll);
        
    })
    
    /*
    var updated = _.merge(poll, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(poll);
    });
    */
  });
    
};

/*


// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Poll.findById(req.params.id, function (err, poll) {
    if (err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    var updated = _.merge(poll, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(poll);
    });
  });
};


// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Poll.findById(req.params.id, function (err, poll) {
    if(err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    poll.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

*/

exports.remove = function(req, res) {
    Poll.findById(req.params.id, function (err, poll){
        if(err) { return handleError(res, err); }
        if(!poll) { return res.status(404).send('Not Found'); }
        poll.remove( function(err) {
            if(err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
        
    });
    
};



function handleError(res, err) {
    console.log("error");
  return res.status(500).send(err);
}