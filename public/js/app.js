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
				placeholder: '4111 1111 1111 1111',
				value: '4111 1111 1111 1111'
      },
      cvv: {
        selector: '#cvv',
				placeholder: '123',
				value: '123'
      },
      expirationMonth: {
        selector: '#expiry-month',
				placeholder: 'MM',
				value: '12',
      },
      expirationYear: {
        selector: '#expiry-year',
				placeholder: 'YYYY',
				value: '2019'
      }
    }
  }, function (err, hostedFieldsInstance) {
	hostedFieldsInstance.on('validityChange', function (event) {
		var field = event.fields[event.emittedBy];
		if (field.isValid) {
			console.log(field.container.innerHTML);
			if (event.emittedBy === 'expirationMonth' || event.emittedBy === 'expirationYear') {
				if (!event.fields.expirationMonth.isValid || !event.fields.expirationYear.isValid) {
					return;
				}
			} else if (event.emittedBy === 'number') {
				$('#card-number').next('span').text('');
			}
			// Remove any previously applied error or warning classes
			$(field.container).parents('.form-group').removeClass('has-warning');
			$(field.container).parents('.form-group').removeClass('has-success');
			// Apply styling for a valid field
			$(field.container).parents('.form-group').addClass('has-success');
		} else if (field.isPotentiallyValid) {
			// Remove styling  from potentially valid fields
			$(field.container).parents('.form-group').removeClass('has-warning');
			$(field.container).parents('.form-group').removeClass('has-success');
			if (event.emittedBy === 'number') {
				$('#card-number').next('span').text('');
			}
		} else {
			// Add styling to invalid fields
			$(field.container).parents('.form-group').addClass('has-warning');
			// Add helper text for an invalid card number
			if (event.emittedBy === 'number') {
				$('#card-number').next('span').text('Looks like this card number has an error.');
			}
		}
	});

	hostedFieldsInstance.on('cardTypeChange', function (event) {
		// Handle a field's change, such as a change in validity or credit card type
		if (event.cards.length === 1) {
			$('#card-type').text(event.cards[0].niceType);
		} else {
			$('#card-type').text('Card');
		}
	});

    $('#payment-form').on('submit', function(evt){
			evt.preventDefault();
			hostedFieldsInstance.tokenize(function (err, payload) {
				if (err) {
					alert('Card Info Fields Error: ' + err.message );
					return;
				}
				console.log(payload);
			});
		});
  });
}
