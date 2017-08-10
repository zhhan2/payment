'use strict';

var _l = require('lodash');
var validators = require('./validators.js');
var braintreeService = require('./braintreeService.js');
var paypalService = require('./paypalService');

// Get error meesage from validators 's error object
var getErrorMessage = function(errors) {
    return errors[0].message;
}
// Init braintree service with credentials
var initBraintree = function(environment, credentials) {
    if (_l.isUndefined(braintreeService.BRAINTREE_ENVIRONMENTS[environment])) {
        throw new Error('Invalid environment.');
    }
    console.log(environment);
    console.log(credentials);
    var errors = validators.braintreeCredentials.validate(credentials);
    if (_l.size(errors) > 0) {
        throw new Error(getErrorMessage(errors));
    }
    console.log('1');
    return braintreeService.init(
        braintreeService.BRAINTREE_ENVIRONMENTS[environment],
        credentials
    );
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
// Create braintree customer
var createBrainTreeCustomer = function(customerInfo, nonce, cb) {
    // @TODO
    console.log(customerInfo);
    var errors = validators.braintreeCustomer.validate(customerInfo);
    if (_l.size(errors) > 0) {
        throw new Error(getErrorMessage(errors));
    }
    return braintreeService.createCustomer(customerInfo, nonce, cb);
}
// Create braintree transactions
var createBraintreeTransaction = function(paymentBody, cb) {
    // vaerify payment body
    var errors = validators.braintreeTransactionBody.validate(paymentBody);
    if (_l.size(errors) > 0) {
        throw new Error(getErrorMessage(errors));
    }
    return braintreeService.createTransaction(paymentBody, cb);
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
    createBrainTreeCustomer: createBrainTreeCustomer,
    createPaypalPayment: createPaypalPayment,
    createBraintreeTransaction: createBraintreeTransaction,
    executePaypalPayment: executePaypalPayment,
    getPaypalPayment: getPaypalPayment,
    getBraintreeTransaction: getBraintreeTransaction,
}
