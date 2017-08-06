'use strict';

var _l = require('lodash');

var validators = require('./validators.js');
var braintreeService = require('./braintreeService.js');
var paypalService = require('./paypalService');

// Get error meesage from validators 's error object
var getErrorMessage = function(errors) {
    var ret = '';
    _l.forEach(_l.map(errors, 'message'), function(message) {
        ret += message + ' ';
    });
    return ret;
}
// Init braintree service with credentials
var initBraintree = function(environment, credentials) {
    if (braintreeService.BRAINTREE_ENVIRONMENTS.indexOf(environment) == -1) {
        throw new Error('Invalid environment.');
    }
    var errors = validators.braintreeCredentials.validate(credentials);
    if (_l.size(errors) > 0) {
        throw new Error(getErrorMessage(errors));
    }
    return braintreeService.init(environment, credentials);
};
// Init paypal service with credetials
var initPaypal = function(credentials) {
    var errors = validators.paypalCredentials.validate(credentials);
    if (_l.size(errors) > 0) {
        throw new Error(getErrorMessage(errors));
    }
    return paypalService.init(credentials);
};
// Get braintree client token
var getBraintreeClientToken = function(options, cb) {
    return braintreeService.getClientToken(options, cb);
};
// Create paypal payment
var createPaypalPayment = function(paymentBody, cb) {
    // vaerify payment body
    var errors = validators.paypalPaymentbody.validate(paymentBody);
    if (_l.size(errors) > 0) {
        throw new Error(getErrorMessage(errors));
    }
    errors = [];
    // verify payment.transactions
    _l.forEach(paymentBody.transactions, function(transactionInfo){
        errors = _l.concat(
            errors,
            validators.paypalTransactionInfo.validate(transactionInfo)
        );
    });
    if (_l.size(errors) > 0) {
        throw new Error(getErrorMessage(errors));
    }
    errors = [];
    // verify credit card info
    if (paymentBody.payer.payment_method == 'credit_card') {
        _l.forEach(_l.map(paymentBody.payer.funding_instruments, 'credit_card')
        ,function(creditCardinfo) {
            errors = _l.concat(
                errors,
                validators.paypalCreditCardInfo.validate(creditCardinfo)
            );
        });
    }
    if (_l.size(errors) > 0) {
        throw new Error(getErrorMessage(errors));
    }
    // Call paypal service
    return paypalService.createPayment(paymentBody, cb);
};
// Create braintree transactions
var createBraintreeTransaction = function(createTransaction, cb) {
    // vaerify payment body
    var errors = validators.braintreeTransactionBody.validate(paymentBody);
    if (_l.size(errors) > 0) {
        throw new Error(getErrorMessage(errors));
    }
    return braintreeService.createTransaction(createTransaction, cb);
};
// Execute paypal payment
var executePaypalPayment = function(id, detail, cb){
    id = _l.toString(id);
    detail = detail || {};
    return paypalService.executePayment(id, detail, cb);
};
// Get paypal payment detail by payment id
var getPaypalPayment = function(id, cb){
    id = _l.toString(id);
    return paypalService.getPayment(id, cb);
};
// Get braintree trasaction detail by transaction id
var getBraintreeTransaction = function(id, cb) {
    id = _l.toString(id);
    return braintreeService.getTransactionInfo(id, info);
}

module.exports = {
    initBraintree: initBraintree,
    initPaypal: initPaypal,
    getBraintreeClientToken: getBraintreeClientToken,
    createPaypalPayment: createPaypalPayment,
    createBraintreeTransaction: createBraintreeTransaction,
    executePaypalPayment: executePaypalPayment,
    getPaypalPayment: getPaypalPayment,
    getBraintreeTransaction: getBraintreeTransaction
}