const db = require('../data/mongodb')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const insecurity = require('../lib/insecurity')
const logger = require('../lib/reviewLogger')
const fs = require('fs');
const path = require('path');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';
const jwt = require('jsonwebtoken')

module.exports = function productReviews () {
  return (req, res, next) => {
    const user = insecurity.authenticatedUsers.from(req)
    if (user && user.data.email !== req.body.author && utils.notSolved(challenges.forgedReviewChallenge)) {
      utils.solve(challenges.forgedReviewChallenge)
    }

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    let authHeader = req.headers.authorization;
    authHeader = authHeader.replace('Bearer ', '')
    let obj = jwt.decode(authHeader, insecurity.publicKey)


    logger.info('Author: ' + req.body.author + ' with ID of: ' + obj.data.id + ' + posted a review on the product of id: ' + req.params.id + ' Email: ' + obj.data.email);

    db.reviews.insert({
      product: req.params.id,
      message: req.body.message,
      author: req.body.author,
      likesCount: 0,
      likedBy: []
    }).then(result => {
      res.status(201).json({ staus: 'success' })
    }, err => {
      res.status(500).json(err)
    })
  }
}
