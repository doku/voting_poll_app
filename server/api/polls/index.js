'use strict';

var express = require('express');
var controller = require('./polls.controller');

var router = express.Router();

router.get('/:name/all', controller.index);
router.get('/:name/:poll_name', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.vote);
router.delete('/:id', controller.remove);


/*
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

*/

module.exports = router;