'use strict';

$(function () {
	// init braintree hosted fields
	$.get(
		'/braintree/clientToken',
		{},
		function (data, status) {
			if (status = 'success') {
				var token = data.content.clientToken;
				braintree.client.create({
					authorization: token
				}, function(err, clientInstance) {
					if (err) {
						console.error(err);
						return;
					}
					createHostedFields(clientInstance);
				});
			} else {
				alert('Can not get braintree client token.');
			}
		}
	)
});

// found at: http://webstandardssherpa.com/reviews/auto-detecting-credit-card-type/
function getCreditCardType(accountNumber) {
	//start without knowing the credit card type
	var result = "unknown";

	//first check for MasterCard
	if (/^5[1-5]/.test(accountNumber)) {
		result = "Mastercard";
	}

	//then check for Visa
	else if (/^4/.test(accountNumber)) {
		result = "Visa";
	}

	//then check for AmEx
	else if (/^3[47]/.test(accountNumber)) {
		result = "Amex";
	}

	return result;
}

function getPaymentInfo () {
	return {
		amount: $('#amount').val(),
		currency: $('#currency').val(),
		firstName: $('#card-holder-first-name').val(),
		lastName: $('#card-holder-last-name').val(),
		cardNumber: $('#card-number').val(),
		expiryMonth: $('#expiry-month').val(),
		expiryYear: $('#expiry-year').val(),
		cvv: $('#cvv').val()
	};
}

function createHostedFields(clientInstance) {
  braintree.hostedFields.create({
    client: clientInstance,
    styles: {
    },
    fields: {
      number: {
        selector: '#card-number',
		placeholder: '4111 1111 1111 1111'
      },
      cvv: {
        selector: '#cvv',
		placeholder: '123'
      },
      expirationMonth: {
        selector: '#expiry-month',
		placeholder: 'MM'
      },
      expirationYear: {
        selector: '#expiry-year',
		placeholder: 'YYYY'
      }
    }
  }, function (err, hostedFieldsInstance) {
    $('#payment-form').on('submit', function(evt){
		evt.preventDefault();
		console.log($('#card-number').val());
		hostedFieldsInstance.tokenize(function (err, payload) {
			if (err) {
				console.error(err);
				return;
			}
			console.log(payload.nonce);
			alert('Submit your nonce to your server here!');
      	});
	});
  });
}