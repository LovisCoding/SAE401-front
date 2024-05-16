const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

const cors = require('cors');
app.use(cors());

// sendFile will go here
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/src/html/index.html'));
});
app.get('/login', function(req, res) {
	res.sendFile(path.join(__dirname, '/src/html/connection.html'));
  });
  app.use(express.static('src/css'))
  app.use(express.static('src/js'))
  app.use(express.static('src/assets'))
  

app.get('/home', function(req, res) {
  res.sendFile(path.join(__dirname, '/src/html/home.html'));
});

app.get('/import', function(req, res) {
  res.sendFile(path.join(__dirname, '/src/html/import.html'));
});

app.get('/export', function(req, res) {
  res.sendFile(path.join(__dirname, '/src/html/export.html'));
});

app.listen(port);
console.log('Server started at http://localhost:' + port);