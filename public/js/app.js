'use strict';

$(function() {
	var navListItems = $('ul.setup-panel li a');
	var cardInfoTab = $('ul.setup-panel li:eq(1)');
	var allWells = $('.setup-content');

    allWells.hide();

    navListItems.click(function(e)
    {
        e.preventDefault();
        var target = $($(this).attr('href'));
        var item = $(this).closest('li');
        if (!item.hasClass('disabled')) {
            navListItems.closest('li').removeClass('active');
            item.addClass('active');
			if ($(this).attr('href') == '#customer-info-form') {
				cardInfoTab.addClass('disabled');
			}
            allWells.hide();
            target.show();
        }
    });

	$('#customer-info-form').on('submit', function(evt) {
		evt.preventDefault();
		var gateway = getPaymentGateway();
		if (gateway == 'unknown') {
			alert('American Express can only pay with USD.');
			return false;
		}
		$('ul.setup-panel li:eq(1)').removeClass('disabled');
        $('ul.setup-panel li a[href="#card-info-form"]').trigger('click');
		$(this).hide();
		createCardInfoForm(gateway);
	})
});

function getPaymentGateway() {
	var currency = $('#currency').val().toLowerCase();
	var cardType = $('#card-type').val();
	if (cardType == 'amex') {
		if (currency != 'usd') {
			return 'unknown';
		}
		return 'paypal';
	} else {
		if (currency == 'usd' || currency == 'eur' || currency == 'aud') {
			return 'paypal';
		}
		return 'braintree';
	}
}

function generatePaypalPaymentBody() {
	var gateway = getPaymentGateway();
	if (gateway == 'paypal') {
		var cardInfo = getCardInfoPaypal();
		if (cardInfo) {
			return {
		        amount: $('#amount').val(),
		        currency: $('#currency').val(),
		        cardType: $('#card-type').val(),
		        firstName: $('#first-name').val(),
		        lastName: $('#last-name').val(),
		        phone: $('#phone-number').val(),
				cardNumber: cardInfo.cardNumber,
				expiryMonth: cardInfo.expiryMonth,
				expiryYear: cardInfo.expiryYear,
				cvv: cardInfo.cvv
		    };
		}
		return;
	}
}

function getCardInfoPaypal() {
	var cardType = $('#card-type').val();
	var carNumberInputNode = $('#card-number-paypal');
	var expiryMonthInputNode = $('#expiry-month-paypal');
	var expiryYearInputNode = $('#expiry-year-paypal');
	var cvvInputNode = $('#cvv-paypal');
	if (!carNumberInputNode || !expiryMonthInputNode
	|| !expiryYearInputNode || !cvvInputNode) {
		console.log('Can not get card info.')
		return false;
	}
	if (verifyCardNumber(cardType, carNumberInputNode.val())) {
		if (verifyExpiryDate(expiryMonthInputNode.val(), expiryYearInputNode.val())) {
			return {
				cardNumber: carNumberInputNode.val(),
				expiryMonth: expiryMonthInputNode.val(),
				expiryYear: expiryYearInputNode.val(),
				cvv: cvvInputNode.val()
			}
		} else {
			alert('This card is expired.');
			return false;
		}
	} else {
		alert('This Card is not ' + cardType);
		// Go back to tab 1
		$('ul.setup-panel li a[href="#customer-info-form"]').trigger('click');
		return false;
	}
}

function verifyCardNumber(cardType, cardNumber) {
	return cardType == getCreditCardType(cardNumber);
};

function verifyExpiryDate(expiryMonth, expiryYear) {
	if (!/^(0[1-9]|1[0-2])$/.test(expiryMonth)) {
		return false;
	}
	expiryMonth = parseInt(expiryMonth);
	expiryYear = parseInt(expiryYear);
	var now = new Date();
	var thisYear = parseInt(now.getFullYear());
	var thisMonth = parseInt(now.getMonth());
	if (expiryYear < thisYear) {
		return false;
	} else if (expiryYear == now.getFullYear()) {
		return expiryMonth > thisMonth;
	}
	return true;
}

function getCreditCardType(cardNumber) {
    var result = "unknown";
    //first check for MasterCard
    if (/^5[1-5]/.test(cardNumber)) {
        result = "Mastercard";
    }
    //then check for Visa
    else if (/^4/.test(cardNumber)) {
        result = "Visa";
    }
    //then check for AmEx
    else if (/^(?:3[47][0-9]{13})$/.test(cardNumber)) {
        result = "Amex";
    }
    return result;
}


function createCardInfoForm(gateway) {
	if (gateway == 'paypal') {
		return createPaypalForm();
	} else if (gateway == 'braintree') {
		return createBraintreeForm();
	} else {
		alert('American Express can only pay with USD.');
		return false;
	}
}

function createPaypalForm() {
	$('#card-number').empty();
	$('#expiry-month').empty();
	$('#expiry-year').empty();
	$('#cvv').empty();
	var cardNumberInput = $('<input></input>');
	cardNumberInput.addClass('form-control');
	cardNumberInput.attr('id', 'card-number-paypal');
	cardNumberInput.attr('type', 'text');
	cardNumberInput.attr('type', 'text');
	cardNumberInput.attr('placeholder', 'Card number');
	cardNumberInput.attr('required', true);
	cardNumberInput.keypress(checkNumericalInput);
	var expirationMonthInput = $('<input></input>');
	expirationMonthInput.addClass('form-control');
	expirationMonthInput.attr('id', 'expiry-month-paypal');
	expirationMonthInput.attr('type', 'text');
	expirationMonthInput.attr('placeholder', 'MM');
	expirationMonthInput.attr('maxlength', '2');
	expirationMonthInput.attr('required', true);
	expirationMonthInput.keypress(checkNumericalInput);
	var expirationYearInput = $('<input></input>');
	expirationYearInput.addClass('form-control');
	expirationYearInput.attr('id', 'expiry-year-paypal');
	expirationYearInput.attr('type', 'text');
	expirationYearInput.attr('placeholder', 'YYYY');
	expirationYearInput.attr('maxlength', '4');
	expirationYearInput.attr('required', true);
	expirationYearInput.keypress(checkNumericalInput);
	var cvvInput = $('<input></input>');
	cvvInput.addClass('form-control');
	cvvInput.attr('id', 'cvv-paypal');
	cvvInput.attr('type', 'text');
	cvvInput.attr('placeholder', '123');
	cvvInput.attr('minlength', '3');
	cvvInput.attr('maxlength', '3');
	cvvInput.attr('required', true);
	cvvInput.keypress(checkNumericalInput);
	$('#card-number').removeClass('hosted-field');
	$('#expiry-month').removeClass('hosted-field');
	$('#expiry-year').removeClass('hosted-field');
	$('#cvv').removeClass('hosted-field');
	$('#card-number').append(cardNumberInput);
	$('#expiry-month').append(expirationMonthInput);
	$('#expiry-year').append(expirationYearInput);
	$('#cvv').append(cvvInput);
	$('#card-info-form').on('submit', function(evt) {
		evt.preventDefault();
		var paypalPaymentBody = generatePaypalPaymentBody();
		if (paypalPaymentBody) {
			paypalPaymentBody.gateway = 'paypal';
			$.post(
				'/payment/create',
				paypalPaymentBody,
				function(data, status) {
					if (status = 'success') {
						alert('Success, payment record id: ' + data.payment._id);
						// Go back to tab 1
						$('ul.setup-panel li a[href="#customer-info-form"]').trigger('click');
					} else {
						alert('Payment Error!');
					}
				}
			);
		}
	});
	return;
}

function createBraintreeForm() {
	$('#card-number').empty();
	$('#expiry-month').empty();
	$('#expiry-year').empty();
	$('#cvv').empty();
	$('#card-number').addClass('hosted-field');
	$('#expiry-month').addClass('hosted-field');
	$('#expiry-year').addClass('hosted-field');
	$('#cvv').addClass('hosted-field');
	$.get(
        '/braintree/clientToken', {},
        function(data, status) {
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
    );
}

function createHostedFields(clientInstance) {
	var gateway = getPaymentGateway();
    braintree.hostedFields.create({
        client: clientInstance,
        styles: {},
        fields: {
            number: {
                selector: '#card-number',
                placeholder: '4111 1111 1111 1111',
                value: '4111 1111 1111 1111'
            },
            cvv: {
                selector: '#cvv',
                placeholder: '123'
            },
            expirationMonth: {
                selector: '#expiry-month',
                placeholder: 'MM',
            },
            expirationYear: {
                selector: '#expiry-year',
                placeholder: 'YYYY'
            }
        }
    }, function(err, hostedFieldsInstance) {
        hostedFieldsInstance.on('validityChange', function(event) {
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

        $('#card-info-form').on('submit', function(evt) {
            evt.preventDefault();
            hostedFieldsInstance.tokenize(function(err, payload) {
                if (err) {
                    alert('Card Info Fields Error: ' + err.message);
                    return;
                }
				if ($('#card-type').val() != payload.details.cardType) {
					alert('This Card is not ' + $('#card-type').val());
					// Go back to tab 1
					$('ul.setup-panel li a[href="#customer-info-form"]').trigger('click');
					return false;
				}
				var paymentInfo = {
					gateway: 'braintree',
					amount: $('#amount').val(),
			        currency: $('#currency').val(),
			        cardType: payload.details.cardType,
			        firstName: $('#first-name').val(),
			        lastName: $('#last-name').val(),
			        phone: $('#phone-number').val(),
					paymentMethodNonce: payload.nonce,
					options: {
						submitForSettlement: true
					}
				};
				// paymentInfo.cardType = payload.details.cardType;
				// paymentInfo.nonce = payload.nonce;
				$.post(
					'/payment/create',
					paymentInfo,
					function(data, status) {
			            if (status = 'success') {
							alert('Success, payment record id: ' + data.payment._id);
							// Go back to tab 1
							$('ul.setup-panel li a[href="#customer-info-form"]').trigger('click');
			            } else {
			                alert('Payment Error!');
			            }
			        }
				);
				return;
            });
        });

    });
}

function checkNumericalInput(evt) {
	return evt.charCode >= 48 && evt.charCode <= 57;
}
