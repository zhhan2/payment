'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var recordsSchema = new Schema({
    firstName: String,
    lastName: String,
    phone: String,
    currency: String,
    price: Number,
    createdDate: Date,
    gatewayInfo: { type : mongoose.Schema.Types.Mixed }
});

var Records = mongoose.model('Records', recordsSchema);

module.exports = Records;
