/* eslint-disable */
const bodyParser = require('body-parser');
const express = require('express');
const Post = require('./post.js');

const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;

const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());

// TODO: write your route handlers here
server.get('/posts', (req, res) => {
  Post.find({}, (err, results) => {
    if (err) {
      throw err;
    }
    res.json(results);
  });
});

server.get('/accepted-answer/:soID', (req, res) => {
  const id = req.params.soID;
  Post.findOne({ soID: id })
    .exec((err, answer) => {
      if (err) {
        res.status(STATUS_USER_ERROR);
        res.json(err);
        return;
      }
      Post.findOne({ soID: answer.acceptedAnswerID })
        .exec((error, ans) => {
          if (error) {
            res.status(STATUS_SERVER_ERROR);
            res.json(error);
            return;
          } else if (!ans) {
            res.status(STATUS_USER_ERROR);
            res.json(error);
            return;
          }
          res.json(ans);
        });
    });
});

server.get('/top-answer/:soID', (req, res) => {
  const id = req.params.soID;
  const highestAnswer = req.params.soID.acceptedAnswerID;
  Post.findOne({ soID: id })
    .exec((err, answer) => {
      if (err) {
        res.status(STATUS_USER_ERROR);
        res.json({error: 'HELLO!'});
        return;
      } else if (!answer) {
        res.status(STATUS_USER_ERROR);
        res.json({ error: 'ID was not found in the database' });
        return;
      }
      Post.find({ parentID: id, soID: { $ne: answer.acceptedAnswerID} })
      .sort({score: 'desc'})
      .exec((error, ans) => {
        if (error) {
          res.status(STATUS_SERVER_ERROR);
          res.json(error);
          return;
        } else if (ans.length < 1) {
          res.status(STATUS_USER_ERROR);
          res.json({error: 'no top answer.'});
        }
        res.json(ans[0]);  
    });
  });
});

module.exports = { server };
