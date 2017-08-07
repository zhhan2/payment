'use strict';

$(function () {
    $('#pay-now').click(function(){
		var paymentInfo = getPaymentInfo();
		$.post(
			"/create",
			paymentInfo,
			function(data, status){
				alert("Data: " + data + "\nStatus: " + status);
			});
    });
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
