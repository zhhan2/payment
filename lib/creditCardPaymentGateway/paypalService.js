'use strict';

var paypal = require('paypal-rest-sdk');
var paypalConfigured = false;
// init paypal gateway
var init = function(credentials) {
    paypalConfigured = true;
    paypal.configure(credentials);
    return;
};
// Crate a payment
var createPayment = function(paymentBody, cb) {
    if (!paypalConfigured) return cb(new Error(
        'Need to configure paypal with credentials first.'
    ));
    paypal.payment.create(paymentBody, function(err, payment) {
        if (err) {
            return cb(err);
        } else {
            return cb(null, payment)
        }
    });
};
// Execute a payment
var executePayment = function(paymentId, paymentDetail, cb) {
    if (!paypalConfigured) return cb(new Error(
        'Need to configure paypal with credentials first.'
    ));
    paypal.payment.execute(paymentId, paymentDetail, function(err, payment) {
        if (err) {
            return cb(err);
        } else {
            return cb(null, payment);
        }
    });
};
// Get a payment
var getPayment = function(paymentId, cb) {
    if (!paypalConfigured) return cb(new Error(
        'Need to configure paypal with credentials first.'
    ));
    paypal.payment.get(paymentId, function(err, payment) {
        if (err) {
            return cb(err);
        } else {
            return cb(null, payment);
        }
    });
};

module.exports = {
    init: init,
    createPayment: createPayment,
    executePayment: executePayment,
    getPayment: getPayment
}
