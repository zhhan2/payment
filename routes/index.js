'use strict';

var paymentGateway = require('../lib/creditCardPaymentGateway');
var paymentHelper = require('../service/paymentHelper.js');

// Routes

exports.index = function (req, res) {
  res.render('index');
};

exports.create = function (req, res) {
	var paymenInfo = req.body;
	var cardType = paymentHelper.getCreditCardType(paymenInfo.cardNumber);
	var paymentMethod = paymentHelper.decidePaymentGateway(cardType, paymenInfo.currency);
	console.log(paymentMethod);
	if (paymentMethod == 'paypal') {
		var paymentBody = paymentHelper.getPaypalPaymentBody(paymenInfo, cardType);
		console.log(JSON.stringify(paymentBody));
		paymentGateway.createPaypalPayment(paymentBody, function (error, paymentDetail) {
			if (error) {
				console.log(error);
				res.send('error', { 'error': error });
			} else {
				console.log(JSON.stringify(paymentDetail));
				req.session.paymentId = paymentDetail.id;
				res.send('create', { 'payment': paymentDetail });
			}
		});
	}
	
};

exports.execute = function (req, res) {
	var paymentId = req.session.paymentId;
	var payerId = req.param('PayerID');

	var details = { "payer_id": payerId };
	var payment = paypal.payment.execute(paymentId, details, function (error, payment) {
		if (error) {
			console.log(error);
			res.render('error', { 'error': error });
		} else {
			res.render('execute', { 'payment': payment });
		}
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
