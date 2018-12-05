'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

/** connecting to the database **/

dotenv.config();

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true }
);

app.use(cors());

/** defining schema **/
const Schema = mongoose.Schema;
const urlInfoSchema = new mongoose.Schema({
  url: String,
  shortID: Number
});
const shortenedURL = mongoose.model('shortenedURL', urlInfoSchema);
let count = 0;

/** mounting body-parser **/
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/new', function(req, res) {
  const url = req.body.url.replace(/(^\w+:|^)\/\//, '');

  dns.lookup(url, (error, address, family) => {
    if (error) {
      console.log("Error! The page doesn't exist");
      res.status(404).json({ message: "The page doesn't exist" });
    }

    const newUrl = new shortenedURL({ url: req.body.url, shortID: count });

    newUrl.save(err => {
      if (err) {
        return res.send('Error saving to database');
      }
    });

    count++;
    return res.json({ newUrl });
  });
});

app.get('/api/shorturl/:shortId', function(req, res, next) {
  const shortId = req.params.shortId;

  shortenedURL.findOne({ shortID: shortId }, (err, data) => {
    if (err) {
      res.send(err);
    }

    res.redirect(301, data.url);
  });
});

app.listen(port, function() {
  console.log('Node.js listening on http://localhost:3000/');
});
