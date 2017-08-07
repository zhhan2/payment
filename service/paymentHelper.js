'use strict';

var _l = require('lodash');

var getCreditCardType = function (accountNumber) {
	//start without knowing the credit card type
	var result = 'unknown';

	//first check for MasterCard
	if (/^5[1-5]/.test(accountNumber)) {
		result = 'mastercard';
	}

	//then check for Visa
	else if (/^4/.test(accountNumber)) {
		result = 'visa';
	}

	//then check for AmEx
	else if (/^3[47]/.test(accountNumber)) {
		result = 'amex';
	}

	return result;
}

var decidePaymentGateway = function (type, currency) {
    if (type = 'amex') {
        if (_l.toUpper(currency) != 'USD') {
            return 'invalid';
        }
        return 'paypal';
    }
    if (_l.includes(['USD', 'EUR', 'AUD'],_l.toUpper(currency))) {
        return 'paypal';
    }
    // return 'braintree';
    return 'paypal';
};

var getPaypalPaymentBody = function(paymentInfo, cardType) {
    return {
        intent: 'sale',
		payer: {
            payment_method: 'credit_card',
            funding_instruments: [
                {
                    credit_card: {
                        type: cardType,
                        number: paymentInfo.cardNumber,
                        expire_month: paymentInfo.expiryMonth,
                        expire_year: paymentInfo.expiryYear,
                        first_name: paymentInfo.firstName,
                        last_name: paymentInfo.lastName
                    }
                }
            ]
		},
		transactions: [{
			amount: {
				currency: paymentInfo.currency,
				total: paymentInfo.amount
            },
		}]
    }
}

module.exports = {
    getCreditCardType: getCreditCardType,
    decidePaymentGateway: decidePaymentGateway,
    getPaypalPaymentBody: getPaypalPaymentBody
}