'use strict';

var braintree = require('braintree');
var gateway;

var BRAINTREE_ENVIRONMENTS = {
    'development': braintree.Environment.Development,
    'qa': braintree.Environment.Qa,
    'sandbox': braintree.Environment.Sandbox,
    'production': braintree.Environment.Production
};
var TRANSACTION_SUCCESS_STATUSES = [
    braintree.Transaction.Status.Authorizing,
    braintree.Transaction.Status.Authorized,
    braintree.Transaction.Status.Settled,
    braintree.Transaction.Status.Settling,
    braintree.Transaction.Status.SettlementConfirmed,
    braintree.Transaction.Status.SettlementPending,
    braintree.Transaction.Status.SubmittedForSettlement
];
// Create braintree connection
var init = function (environment, credentials) {
    gateway =  braintree.connect({
        environment: environment,
        merchantId: credentials.merchantId,
        publicKey: credentials.publicKey,
        privateKey: credentials.privateKey
    });
    return gateway;
};
// Get braintree client token
var getClientToken = function (options, cb) {
    if (!gateway) return cb (new Error(
        'Need to create connection with braintree credentials first.'
    ));
    return gateway.clientToken.generate(options, cb);
};
// Create a transaction
var createTransaction = function (transactionBody, cb) {
    if (!gateway) return cb (new Error(
        'Need to create connection with braintree credentials first.'
    ));
    return gateway.transaction.sale(transactionBody, cb);
};
// Get a trasaction's info by transaction id
var getTransactionInfo = function (id, cb) {
    if (!gateway) return cb (new Error(
        'Need to create connection with braintree credentials first.'
    ));
    gateway.transaction.find(id, function(err, transaction) {
        if (err) return cb(err);
        if (TRANSACTION_SUCCESS_STATUSES.indexOf(transaction.status) > -1) {
            return cb(null, {
                state: 'Success',
                transaction: transaction
            });
        } else {
            return cb(null, {
                state: 'Fail',
                transaction: transaction
            });
        }
    });
};
// Create a customer
var createCustomer = function (customerInfo, nonce, cb) {
    if (!gateway) return cb (new Error(
        'Need to create connection with braintree credentials first.'
    ));
    customerInfo.paymentMethodNonce = nonce;
    console.log('AAAAAAAAAA');
    console.log(customerInfo);
    gateway.customer.create(customerInfo, function (err, result) {
        if (err) return cb(err);
        if (result.success) {
            console.log('BBBBBBBB');
            console.log(result.customer);
            return cb (null, result.customer);
        }
    });
};


module.exports = {
    init: init,
    getClientToken: getClientToken,
    createTransaction: createTransaction,
    getTransactionInfo: getTransactionInfo,
    createCustomer: createCustomer,
    BRAINTREE_ENVIRONMENTS: BRAINTREE_ENVIRONMENTS
};
