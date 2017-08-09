'use strict';

var paymentGateway = require('../lib/creditCardPaymentGateway');
var paymentHelper = require('../service/paymentHelper.js');

// Routes

exports.index = function (req, res) {
  res.render('index');
};

exports.create = function (req, res) {
	var paymenInfo = req.body;
    var cardType = paymenInfo.cardType;
    var currency = paymenInfo.currency;
    var customerInfo = {
        firstName: paymenInfo.firstName,
        lastName: paymenInfo.lastName,
        phone: paymenInfo.phone
    };
    console.log(customerInfo);
    paymentGateway.createBrainTreeCustomer(customerInfo, paymenInfo.nonce, function(err, result){
        return res.status(500).send({
            status: 'fail',
            message: 'Can not creat customer.'
        });
        console.log(result.customer);
        return res.send({ status: 'success' });
    });
	// var paymentMethod = paymentHelper.decidePaymentGateway(cardType, currency);
    // paymentGateway.createCustomer
	// console.log(paymentMethod);
	// if (paymentMethod == 'paypal') {
		// var paymentBody = paymentHelper.getPaypalPaymentBody(paymenInfo, cardType);
		// console.log(JSON.stringify(paymentBody));
		// paymentGateway.createPaypalPayment(paymentBody, function (err, paymentDetail) {
		// 	if (err) {
		// 		console.log(err);
		// 		return res.status(400).send({
		// 			status: 'fail',
		// 			message: 'Can create payment by this card.'
		// 		});
		// 	} else {
		// 		var id = paymentDetail.id;
		// 		return res.status(200).send({
		// 			status: 'success',
		// 			paymentId: id
		// 		});
		// 	}
		// });
	// }

};

exports.getBraintreeToken = function (req, res) {
	paymentGateway.getBraintreeClientToken({}, function (err, token){
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

exports.check = function (req, res) {
	var paymentId = req.params.paymentId;
	paymentGateway.getPaypalPayment(paymentId, function(err, payment) {
		if (err) {
			console.log(err);
			return res.status(400).send({
				status: 'fail',
				message: 'Can not get this payment.'
			});
		}
		return res.status(200).send({
			status: 'success',
			payment: payment
		});
	});
};

exports.cancel = function (req, res) {
  res.render('cancel');
};

// Configuration

exports.init = function (config) {
	paymentGateway.initPaypal(config.paypal);
	paymentGateway.initBraintree('sandbox', config.braintree);
};
