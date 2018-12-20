"use strict";

const _            = require('lodash');
const express      = require('express');
const bodyParser   = require('body-parser');
const config  = require('./knexfile.js');

// Initialize Express.
const app = express();
app.use(bodyParser.json());

// Configure & Initialize Bookshelf & Knex.
console.log('Running in environment: ' + process.env.NODE_ENV);
const knex = require('knex')(config[process.env.NODE_ENV]);
const bookshelf = require('bookshelf')(knex);

// This is a good place to start!

// ***** Models ***** //

const User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  posts: function() {return this.hasMany(Posts, 'author')},
  comments: function() {return this.hasMany(Comments)}
});

const Posts = bookshelf.Model.extend({
  tableName: 'posts',
  hasTimestamps: true,
  author: function() {return this.belongsTo(User, 'author')},
  comments: function() {return this.hasMany(Comments)}
});

const Comments = bookshelf.Model.extend({
  tableName: 'comments',
  hasTimestamps: true,
  post: function() {return this.belongsTo(Post)},
  user: function() {return this.belongsTo(User)}
});

exports.User = User
exports.Posts = Posts
exports.Comments = Comments

// ***** Server ***** //

// ***** Get Requests ***** //

app.get('/user/:id', (request, response) => {

  // response.setHeader("Content-Type", "application/json; charset=utf-8")

  User.forge({id: request.params.id})
    .fetch()
    .then(user => {
      if (_.isEmpty(user)) {
        response.sendStatus(404)
      }
      response.send(user)
    })
    .catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
})

app.get('/post/:id', (request, response) => {

  response.setHeader("Content-Type", "application/json; charset=utf-8")

  Posts.forge({id: request.params.id})
    .fetch({withRelated: ['author', 'comments']})
    .then(post => {
      if (_.isEmpty(post)) {
        response.sendStatus(404)
      }
      response.send(post)
    })
    .catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
})

app.get('/posts', (request, response) => {

  // response.setHeader("Content-Type", "application/json; charset=utf-8")


  Posts
    .collection()
    .fetch({withRelated: ['author', 'comments']})
    .then(posts => {
      if (_.isEmpty(posts)) {
        response.sendStatus(404)
      }
      response.send(posts)
    })
    .catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
})

// ***** Post Requests ***** //

app.post('/user', (request, response) => {

  // response.setHeader("Content-Type", "application/json; charset=utf-8")

  const { name, username, email } = request.body

  if (!name || !username || !email) {
    return response.sendStatus(400)
  }

  User.forge(request.body).save()
    .then(user => response.send(user))
    .catch(() => response.sendStatus(400))
})


app.post('/post', (request, response) => {

  // response.setHeader("Content-Type", "application/json; charset=utf-8")

  const { title, body, author } = request.body

  if (!title || !body || !author) {
    return response.sendStatus(400)
  }

  Posts.forge(request.body).save()
    .then(post => response.send(post))
    .catch(() => response.sendStatus(400))
})


app.post('/comment', (request, response) => {

  // response.setHeader("Content-Type", "application/json; charset=utf-8")

  const { body, user_id, post_id } = request.body

  if (!body || !user_id || !post_id) {
    return response.sendStatus(400)
  }

  Comments.forge(request.body).save()
    .then(comment => response.send(comment))
    .catch(() => response.sendStatus(400))
})

// Exports for Server hoisting.
const listen = (port) => {
  return new Promise((resolve, reject) => {
    app.listen(port, () => {
      resolve();
    });
  });
};

exports.up = (justBackend) => {
  return knex.migrate.latest([process.env.NODE_ENV])
    .then(() => {
      return knex.migrate.currentVersion();
    })
    .then((val) => {
      console.log('Done running latest migration:', val);
      return listen(3000);
    })
    .then(() => {
      console.log('Listening on port 3000...');
    });
};
