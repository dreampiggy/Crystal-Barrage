var express = require('express');
var bodyParser = require('body-parser');
var handler = require('./handler');
var app = express();
var middlewares = require('express-middlewares-js');
var request = require('superagent');
var fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/weixin', middlewares.xmlBodyParser({
  type: 'text/xml'
}));

app.get('/weixin', handler.getWeixin);
app.get('/luck',handler.getLuck);
app.post('/weixin', handler.postWeixin);

app.use(function(req, res) {
	res.status(404).end();
});


app.listen(80);
console.log('Server Start!');
