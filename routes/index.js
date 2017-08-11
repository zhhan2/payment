'use strict';

var paymentGateway = require('../lib/creditCardPaymentGateway');
var paymentHelper = require('../service/paymentHelper.js');

// Routes

exports.index = function(req, res) {
    res.render('index');
};

exports.create = function(req, res) {
    var paymentInfo = req.body;
    var firstName = paymentInfo.firstName;
    var lastName = paymentInfo.lastName;
    var phone = paymentInfo.phone;
    var currency = paymentInfo.currency;
    var amount = paymentInfo.amount;
    if (paymentInfo.gateway == 'paypal') {
        var paymentBody = paymentHelper.getPaypalPaymentBody(paymentInfo);
        paymentGateway.createPaypalPayment(paymentBody, function(err, paymentDetail) {
            if (err) {
                console.log(JSON.stringify(err));
                return res.status(400).send({
                    status: 'fail',
                    message: 'Can create payment by this card.'
                });
            } else {
                var paymentId = paymentDetail.id;
                paymentHelper.savePaymentRecord(
                    'paypal',
                    paymentId, {
                        firstName: firstName,
                        lastName: lastName,
                        phone: phone
                    }, {
                        currency: currency,
                        price: amount
                    },
                    function(err, record) {
                        if (err) {
                            return res.status(400).send({
                                status: 'fail',
                                message: 'Can not save payment record.'
                            });
                        }
                        return res.status(200).send({
                            status: 'success',
                            payment: record
                        });
                    });
            }
        });
    } else if (paymentInfo.gateway == 'braintree') {
        paymentGateway.createBraintreeTransaction(paymentInfo, function(err, result) {
            if (err) {
                console.log(JSON.stringify(err));
                return res.status(400).send({
                    status: 'fail',
                    message: 'Can create payment by this card.'
                });
            } else {
                var paymentId = result.transaction.id;
                paymentHelper.savePaymentRecord(
                    'braintree',
                    paymentId, {
                        firstName: firstName,
                        lastName: lastName,
                        phone: phone
                    }, {
                        currency: currency,
                        price: amount
                    },
                    function(err, record) {
                        if (err) {
                            return res.status(400).send({
                                status: 'fail',
                                message: 'Can not save payment record.'
                            });
                        }
                        return res.status(200).send({
                            status: 'success',
                            payment: record
                        });
                    });
            }
        });
    } else {
        return res.status(200).send({
            status: 'fail',
            message: 'Invalid gateway.'
        });
    }
};

exports.getBraintreeToken = function(req, res) {
    paymentGateway.getBraintreeClientToken({}, function(err, token) {
        if (err) {
            return res.status(500).send({
                status: 'fail',
                message: 'Can not get braintree client token.'
            });
        }
        return res.status(200).send({
            status: 'success',
            content: token
        });
    });
}

exports.check = function(req, res) {
    var paymentId = req.query.paymentId;
    var firstName = req.query.firstName;
    var lastName = req.query.lastName;
    paymentHelper.getPaymentRecord({
        _id: paymentId,
        firstName: firstName,
        lastName: lastName
    }, function(err, payment) {
        if (err) {
            console.log(err);
            return res.send({
                status: 'fail',
                message: 'Can not find this payment.'
            });
        }
        if (!payment) {
            return res.send({
                status: 'fail',
                message: 'Can not find this payment.'
            });
        } else {
            return res.status(200).send({
                status: 'success',
                payment: payment
            });
        }
    });
};

exports.cancel = function(req, res) {
    res.render('cancel');
};

// Configuration

exports.init = function(config) {
    paymentGateway.initPaypal(config.paypal);
    paymentGateway.initBraintree('sandbox', config.braintree);
};
