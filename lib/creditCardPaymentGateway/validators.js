'use strict';

var schema = require('validate');

var braintreeCredentials = schema({
    merchantId: {
        type: 'string',
        required: true
    },
    publicKey: {
        type: 'string',
        required: true
    },
    privateKey: {
        type: 'string',
        required: true
    }
});

var paypalCredentials = schema({
    client_id: {
        type: 'string',
        required: true
    },
    client_secret: {
        type: 'string',
        required: true
    }
});

var paypalPaymentbody = schema({
    intent: {
        type: 'string',
        required: true
    },
    redirect_urls: {
        required: false,
        return_url: {
            type: 'string',
            required: true
        },
        cancel_url: {
            type: 'string',
            required: true
        }
    },
    payer: {
        payment_method: {
            type: 'string',
            required: true
        },
        funding_instruments: {
            type: 'array',
            minItems: 0,
        }
    },
    transactions: {
        type: 'array',
        minItems: 1
    } 
});

var paypalCreditCardInfo = schema({
    type: {
        type: 'string',
        required: true
    },
    number: {
        type: 'string',
        required: true
    },
    expire_month: {
        type: 'string',
        required: true
    },
    expire_year: {
        type: 'string',
        required: true
    },
    first_name: {
        type: 'string',
        required: true
    },
    last_name: {
        type: 'string',
        required: true
    }
});

var paypalTransactionInfo = schema({
    amount: {
        currency: {
            type: 'string',
            required: true
        },
        total: {
            type: 'number',
            required: true
        }
    },
    description: {
        type: 'string',
        required: false
    }
});

var braintreeTransactionBody = schema({
    amount: {
        type: 'number',
        required: true
    },
    paymentMethodNonce: {
        required: true
    },
    options: {
      submitForSettlement: {
          type: 'boolean',
          reuqired: true
      }
    }
});

module.exports = {
    braintreeCredentials: braintreeCredentials,
    paypalCredentials: paypalCredentials,
    paypalPaymentbody: paypalPaymentbody,
    paypalCreditCardInfo: paypalCreditCardInfo,
    paypalTransactionInfo: paypalTransactionInfo,
    braintreeTransactionBody: braintreeTransactionBody
}