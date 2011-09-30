var express = require('express');
var app = express.createServer();
var uglify = require('uglify-js');
uglify.middleware = require('uglify-js-middleware');

app.configure(function(){
    app.use(uglify.middleware({src: __dirname + '/client', dest: __dirname + '/public'}));
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler());
    app.use(express.bodyParser());
});
app.get('/echo', function(req, res) {
   res.send('hi'); 
});
app.listen(3501);
