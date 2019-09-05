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

// Data models
const User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  posts: function() {
    return this.hasMany(Posts, 'author');
  },
  comments: function() {
    return this.hasMany(Comments);
  }
});
  
const Posts = bookshelf.Model.extend({
  tableName: 'posts',
  hasTimestamps: true,
  author: function() {
    return this.belongsTo(User, 'author');
  },
  comments: function() {
    return this.hasMany(Comments);
  }
});
  
const Comments = bookshelf.Model.extend({
  tableName: 'comments',
  hasTimestamps: true,
  posts: function() {
    return this.belongsTo(Posts);
  },
  user: function() {
    return this.belongsTo(User);
  }
});

exports.User = User;
exports.Posts = Posts;
exports.Comments = Comments;


// Express routing
const strongParams = (requiredKeys, req) => {
  return  _.every(requiredKeys, _.partial(_.has, req.body));
}

app.post('/user', (req, res) => {
  const requiredKeys = ['name', 'username', 'email'];  

  if (strongParams(requiredKeys, req)) {
    User
      .forge(req.body)
      .save()
      .then(function(model) {
        res.send(model);
    })
    .catch((error) => {
        console.error(error);
        res.sendStatus(500);
      });    
  } else {
    res.status(400).send('Bad Request');
  }
})

app.get('/user/:id', (req, res) => {
  User
    .forge(req.params)
    .fetch()
    .then((model) => {
      if (_.isEmpty(model)) {
        return res.sendStatus(404);
      }    
      res.send(model);
    })
    .catch((err) => {    
      console.error(err);
      return res.sendStatus(500);
    })    
});

app.get('/posts', (req, res) => {
  Posts
    .fetchAll()
    .then((model) => {
      res.send(model);    
    })
    .catch((error) => {
      res.sendStatus(500);
    });
});

app.get('/post/:id', (req, res) => {         
  Posts
    .forge(req.params)
    .fetch({
        withRelated: ['author', 'comments']
    })
    .then((model) => {
      if (_.isEmpty(model)) {
        return res.sendStatus(404);
      } 
      res.send(model);
    })
    .catch((err) => {    
      console.error(err);
      return res.sendStatus(500);
    })    
});

app.post('/post', (req, res) => {
  const requiredKeys = ['title', 'body', 'author'];

  if (strongParams(requiredKeys, req)) {
    Posts
      .forge(req.body)
      .save()
      .then((model) => {
        res.send(model);
      })
      .catch((error) => {
        console.error(error);
        res.sendStatus(500);
      });    
  } else {
    res.status(400).send('Bad Request');
  }
});

app.post('/comment', (req, res) => {
  const requiredKeys = ['body', 'user_id', 'post_id'];

  if (strongParams(requiredKeys, req)) {
    Comments
      .forge(req.body)
      .save()
      .then((model) => {
        res.send(model);
      })
      .catch((error) => {
        console.error(error);
        res.sendStatus(500);
      });    
  } else {
    res.status(400).send('Bad Request');
  }
});

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





