'use strict';

var self = sendXMLResponse;
module.exports = self;
global.sendXMLResponse = self;

function sendXMLResponse(res, obj) {
  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(obj);
}

