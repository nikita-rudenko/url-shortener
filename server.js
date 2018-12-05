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
const shortenedUrlSchema = new mongoose.Schema({
  url: String,
  shortID: Number
});
const shortenedURL = mongoose.model('shortenedURL', shortenedUrlSchema);

/** mounting body-parser **/
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/new', function(req, res) {
  const url = req.body.url.replace(/(^\w+:|^)\/\//, '');

  /** checking if the address valid using dns.lookup() **/

  dns.lookup(url, (error, address, family) => {
    if (error) {
      res.status(404).json({ message: "The page doesn't exist" });
    }

    /** defining short countID: countID = (all documents in db) + 1 **/
    let countID = 0;
    shortenedURL.countDocuments({}, function(err, count) {
      countID = count + 1;
      const newUrl = new shortenedURL({ url: req.body.url, shortID: countID });

      newUrl.save(err => {
        if (err) {
          return res.send('Error saving to database');
        }

        return res.json({ url: newUrl.url, shortId: newUrl.shortID });
      });
    });
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
