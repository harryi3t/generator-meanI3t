'use strict';
var mongoose = require('mongoose');
var UserModel = mongoose.model('User', require('./Schema.js'));

module.exports = UserModel;
