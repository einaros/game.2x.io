var express = require('express');
var app = express.createServer();

app.configure(function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler());
});
app.get('/echo', function(req, res) {
   res.send('hi'); 
});
app.listen(8000);
