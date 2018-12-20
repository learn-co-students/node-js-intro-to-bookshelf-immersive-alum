"use strict";

const _       = require('lodash');
const expect  = require('unexpected');
const request = require('supertest');
const baseUrl = 'http://localhost:3000';

const blog = require('../blog_server');

let mockUser = {
  name: 'Sally Low',
  username: 'sally',
  email: 'sally@example.org',
  // password: 'password',
};

let mockPost = {
  title: 'Test Post',
  body: 'This is just a test post with no content.'
};

let mockComment = {
  body: 'This is just a test comment.'
};

const cleanup = () => {
  return Promise.all([
    blog.Comments.where('id', '!=', 0).destroy(),
    blog.Posts.where('id', '!=', 0).destroy(),
    blog.User.where('id', '!=', 0).destroy()
  ]);
};

let loginData = {
  username: mockUser.username,
  password: mockUser.password
};

describe('Server', () => {

  // after((done) => {
  //   return cleanup().then(() => {
  //     done();
  //   }).catch(done);
  // });

  describe('/user endpoint', () => {

    // afterEach((done) => {
    //   cleanup().then(() => {
    //     done();
    //   }).catch(done);
    // });

    it('POST to /user with valid data returns new user id', (done) => {
      request(baseUrl)
        .post('/user')
        .send(mockUser)
        .expect(200)
        .end((err, resp) => {
          if (err) done(err);
          expect(resp.body, 'to have key', 'id');
          expect(resp.body.id, 'to be a', 'number');
          done();
        });
    });

    // it('POST to /user with invalid data returns 400', (done) => {
    //   request(baseUrl)
    //     .post('/user')
    //     .send({})
    //     .expect(400, done);
    // });

    it('GET to /user/:id with id specified returns usr object', (done) => {
      blog.User.forge().save(mockUser).then((usr) => {
        request(baseUrl)
          .get('/user/' + usr.get('id'))
          .expect(200)
          .end((err, resp) => {
            if (err) done(err);
            expect(resp.body, 'to have keys', [
              'id',
              'name',
              'username',
              'email',
              'created_at',
              'updated_at',
            ]);
            expect(resp.body.id, 'to be a', 'number');
            expect(resp.body.id, 'to be', usr.get('id'));
            expect(resp.body.name, 'to be', mockUser.name);
            expect(resp.body.username, 'to be', mockUser.username);
            expect(resp.body.email, 'to be', mockUser.email);
            done();
          });
      });
    });

    it('GET to /user/:id with non-existant user specified returns 404', (done) => {
       request(baseUrl)
        .get('/user/' + 7009)
        .expect(404, done);
    });

  });


  describe('/post endpoint:', () => {

    // afterEach((done) => {
    //   cleanup().then(() => {
    //     done();
    //   }).catch(done);
    // });

    it('POST to /post with post data returns new post id', (done) => {
      blog.User.forge().save(mockUser).then((usr) => {
        let data = _.extend({author: usr.get('id')}, mockPost);
        request(baseUrl)
          .post('/post')
          .send(data)
          .expect(200)
          .end((err, resp) => {
            if (err) return done(err);
            expect(resp.body, 'to have key', 'id');
            expect(resp.body.id, 'to be a', 'number');
            done();
          });
      });
    });

    // it('POST to /post with invalid data returns 400', (done) => {
    //   request(baseUrl)
    //     .post('/post')
    //     .send({})
    //     .expect(400, done);
    // });

    it('GET to /post/:id with id specified returns post object', (done) => {
      let createUser = blog.User.forge().save(mockUser);
      let testUserId;
      blog.User
        .forge()
        .save(mockUser)
        .then((usr) => {
          testUserId = usr.get('id');
          return blog.Posts
            .forge()
            .save(_.extend({author: testUserId}, mockPost));
        })
        .then((post) => {
          request(baseUrl)
            .get('/post/' + post.get('id'))
            .expect(200)
            .end((err, resp) => {
              if (err) done(err);
              expect(resp.body, 'to have keys', [
                'id',
                'title',
                'body',
                'created_at',
                'updated_at',
              ]);
              expect(resp.body.id, 'to be a', 'number');
              expect(resp.body.id, 'to be', post.get('id'));
              expect(resp.body.title, 'to be', mockPost.title);
              expect(resp.body.body, 'to be', mockPost.body);
              expect(resp.body.author, 'to be a', 'object');
              expect(resp.body.author.id, 'to be', testUserId);
              expect(resp.body.author.name, 'to be', mockUser.name);
              done();
          });
        }).catch(done);
    });

    it('GET to /post/:id with non-existant user id specified returns 404', (done) => {
      request(baseUrl)
        .get('/post/' + 10000095)
        .expect(404, done);
    });

  });

  describe('/posts endpt', () => {

    // afterEach((done) => {
    //   return cleanup().then(() => {
    //     done();
    //   }).catch(done);
    // });

    it('GET to /posts returns a list of all the posts', (done) => {
      blog.User.forge().save(mockUser).then((usr) => {
        return  blog.Posts
          .forge()
          .save(_.extend({author: usr.get('id')}, mockPost));
      }).then((post) => {
        request(baseUrl)
          .get('/posts')
          .expect(200)
          .end((err, resp) => {
            if (err) return done(err);
            expect(resp.body, 'to be a', 'array');
            done();
          });
      }).catch(done);
    });

  });

  describe('/comment endpt', () => {

    // afterEach((done) => {
    //   return cleanup().then(() => {
    //     done();
    //   }).catch(done);
    // });

    it('POST to /comment with valid data returns new comment id', (done) => {
      let testUserId;
      blog.User.forge().save(mockUser).then((usr) => {
        testUserId = usr.get('id');
        return blog.Posts
          .forge()
          .save(_.extend({author: testUserId}, mockPost));
      }).then((post) => {
        request(baseUrl)
          .post('/comment')
          .send(_.extend({
            user_id: testUserId,
            post_id: post.get('id')
          }, mockComment))
          .expect(200)
          .end((err, resp) => {
            if (err) done(err);
            expect(resp.body, 'to have key', 'id');
            expect(resp.body.id, 'to be a', 'number');
            done();
          });
      }).catch(done);
    });

    // it('POST to /comment with empty data returns 400', (done) => {
    //   request(baseUrl)
    //     .post('/comment')
    //     .send({})
    //     .expect(400, done);
    // });

    it('GET to /post/:id where post has comment includes comments in response', (done) => {
      let testUserId;
      let testPostId;
      blog.User.forge().save(mockUser).then((usr) => {
        testUserId = usr.get('id');
        return blog.Posts
          .forge()
          .save(_.extend({author: testUserId}, mockPost));
      }).then((post) => {
        testPostId = post.get('id');
        return blog.Comments
          .forge()
          .save({
            user_id: testUserId,
            post_id: post.get('id')
          }, mockComment);
      }).then(() => {
        request(baseUrl)
          .get('/post/' + testPostId)
          .expect(200)
          .end((err, resp) => {
            if (err) done(err);
            expect(resp.body, 'to have key', 'comments');
            expect(resp.body.comments, 'to be a', 'array');
            expect(resp.body.comments, 'to have length', 1);
            done();
          });
      });

    });

  });

});
