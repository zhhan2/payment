'use strict';

var jwt = require('jsonwebtoken');
var config = require('../config.js');

var tokenValidator = function(req, res, next) {
    jwt.verify(req.body.token, config.jwt_secret, function(err, decodedBody) {
        if (err) return res.status(400).send({
            status: 'fail',
            message: 'Invalid token'
        });
        req.body = decodedBody;
        return next();
    });
};

module.exports = {
    tokenValidator: tokenValidator
};
