var express = require('express');
var routes = require('./routes');
var config = require('./config.js');
var middleware = require('./middleware');
var http = require('http');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var errorhandler = require('errorhandler');
var mongoose = require('mongoose');
var router = express.Router();


var app = express();
routes.init(config.api);
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
    app.use(errorhandler());
}
// serve html
router.get('/', function (req,res) {
    res.sendFile(path.join(__dirname, './public/html', 'index.html'));
});
router.get('/check', function (req,res) {
    res.sendFile(path.join(__dirname, './public/html', 'check.html'));
});
router.get('/braintree/clientToken', routes.getBraintreeToken);
router.post('/payment/create', routes.create);
router.get('/payment', routes.check);
router.get('/cancel', routes.cancel);

app.use('/', router);


mongoose.connect('mongodb://localhost/payment', function(err){
    if(err) {
        console.dir(err);
        console.log("DB connection error");
        mongoose.disconnect();
        process.exit(1);
        return;
    }
    console.log('DB connected');
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
