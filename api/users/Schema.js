'use strict';
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  total: Number,
  won: Number
});

userSchema.set('toJSON', {
  getters : true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = userSchema;

userSchema.index({projectId: 1}, {unique: true});
