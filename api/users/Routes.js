'use strict';

module.exports = userRoutes;

function userRoutes(app) {
  app.get('/users/:id', require('./getById.js'));
  app.get('/users', require('./getS.js'));
  app.put('/users/:id', require('./putById.js'));
  app.post('/users', require('./post.js'));
  app.delete('/users/:id', require('./deleteById.js'));
}
