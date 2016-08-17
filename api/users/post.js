'use strict';

var self = post;
module.exports = self;

var UserModel = require('./Model.js');

function post(req, res) {
  var bag = {
    inputParams: req.params,
    reqBody: req.body,
    resBody: null,
  };

  bag.who = 'Users|' + self.name;
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _post.bind(null, bag)
    ],
    function(err){
      logger.info(bag.who, 'Completed');
      if (err)
        return respondWithError(res, err);

      sendJSONResponse(res, bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');
  if (!bag.reqBody)
    return next(
      new ActErr(who, ActErr.BodyNotFound, 'Missing body')
    );

  if (!bag.reqBody.username)
    return next(
      new ActErr(who, ActErr.ParamNotFound, 'Missing body.username')
    );

  return next();
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  UserModel.create({username: bag.reqBody.username}, function (err, user) {
    if (err)
      return next(
        new ActErr(who, ActErr.DBOperationFailed, 'UserModel.create', err)
      );

    bag.resBody = user;
    return next();
  });
}
