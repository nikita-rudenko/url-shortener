'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** connecting to the database **/ 

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

app.use(cors());

// defining schema 

var Schema = mongoose.Schema;
var urlInfoSchema = new mongoose.Schema({
  url: String,
  shortID: Number
});
var shortenedURL = mongoose.model('shortenedURL', urlInfoSchema);
var count = 0;

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/new', function (req, res, next) {

  var url = req.body.url.replace(/(^\w+:|^)\/\//, '');

  dns.lookup(url, (error, address, family) => {
    if(error){
      console.log("Error! The page doesn't exist");
      res.status(404).json({ message:"The page doesn't exist" });
  }
      
  var newUrl = new shortenedURL({ url: req.body.url, shortID: count });
    
    newUrl.save(err => {
      if(err){
        return res.send("Error saving to database");
      }
    });
    
      count++;
      return res.json({ newUrl });
  });
    
});
  
app.get('/api/shorturl/:shortId', function (req, res, next){
    
    var shortId = req.params.shortId;
  
    shortenedURL.findOne({ shortID: shortId}, (err, data) => {
    if(err){
      res.send(err);
    }
      
    var url = data.url;
      
    res.redirect(301, data.url);
    });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});