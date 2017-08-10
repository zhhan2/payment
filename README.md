# Credit Card Payment
A practicing WEB APP using PayPal and Braintree gateway

This application is implemented with Node js Express, redis client and MongoDB. Please make sure you have setup environment locally.

## build commands
Start redis server:
```
redis-server
```
Run the appication in local
```
git clone https://github.com/zhhan2/payment.git
cd payment
npm install
node app.js
```
Go to [LOCALHOST](http://localhost:3000) to test the server.

## DB Schema For Payment Record
```
firstName: String,
lastName: String,
phone: String,
currency: String,
price: Number,
createdDate: Date,
gatewayInfo: {
    gateway: String,
    paymentId: String
}
```

## Module Structure

* /libs/creditCardPaymenGateway ==> the library handling all operations with Paypal and Braintree SDK.
* /middleware ==> exporting the middleware to handle and verify the API calls
* /models ==> DB Schemas
* /public ==> HTML JS and CSS
* /routes ==> API call handlers
* /service ==> Helper function (DB, cache)
