'use strict';

var _l = require('lodash');
var mongoose = require('mongoose');
var Records = require('../models/records.js');
var redis = require("redis");
var client = redis.createClient();

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
    return 'braintree';
};

var getPaypalPaymentBody = function(paymentInfo) {
    return {
        intent: 'sale',
		payer: {
            payment_method: 'credit_card',
            funding_instruments: [
                {
                    credit_card: {
                        type: paymentInfo.cardType.toLowerCase(),
                        number: paymentInfo.cardNumber,
                        expire_month: paymentInfo.expiryMonth,
                        expire_year: parseInt(paymentInfo.expiryYear),
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
};

var savePaymentRecord = function(gateway, paymentId, customerInfo, transactionInfo, cb) {
	var newRecord = new Records({
		gateway: gateway,
		firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        phone: customerInfo.phone,
        currency: transactionInfo.currency,
        price: transactionInfo.price,
        createdDate: new Date(),
        gatewayInfo: {
			gateway: gateway,
			paymentId: paymentId
		}
	});
	newRecord.save(function(err, record){
		if (err) return cb(err);
		var cacheKey = generateCacheKey({
			_id: record._id,
			firstName: record.firstName,
			lastName: record.lastName
		});
		saveToCache(cacheKey, record);
		return cb(null, record);
	});
};

var getPaymentRecord = function(query, cb) {
	var cacheKey = generateCacheKey(query);
	client.get(cacheKey, function(err, reply) {
		if (err) return cb(err);
	    if (_l.size(reply) > 0) {
			return cb(null, JSON.parse(reply));
		}
		mongoose.model('Records').findOne({
			_id: query._id,
			firstName: query.firstName,
			lastName: query.lastName
		}, function(err, record){
			if (err) return cb(err);
			if (!_l.isUndefined(record)) {
				saveToCache(cacheKey, record);
				return cb(null, record);
			}
		});
	});
};

var generateCacheKey = function(queryBody) {
	var cacheKey = '';
	var keys = _l.keys(queryBody);
	keys = _l.sortedUniq(keys);
	_l.forEach(keys, function(key, index){
		cacheKey += key + '=' + queryBody[key];
		cacheKey += index < _l.size(keys) - 1 ? '&' : '';
	});
	return cacheKey;
};

var saveToCache = function(cacheKey, object) {
	client.set(cacheKey, JSON.stringify(object), 'EX', '3600');
	return;
};

module.exports = {
    getCreditCardType: getCreditCardType,
    decidePaymentGateway: decidePaymentGateway,
    getPaypalPaymentBody: getPaypalPaymentBody,
	savePaymentRecord: savePaymentRecord,
	getPaymentRecord: getPaymentRecord
}
