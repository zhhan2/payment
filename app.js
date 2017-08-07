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
var router = express.Router();


var app = express();
routes.init(config.api);

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
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
// serve index.html
router.get('/', function (req,res) {
    res.sendFile(path.join(__dirname, './public/html', 'index.html'));
});

router.post('/create', routes.create);
router.get('/execute', routes.execute);
router.get('/cancel', routes.cancel);

app.use('/', router);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});