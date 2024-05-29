const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
	origin: true,
	optionSuccessStatus:200
}));

// sendFile will go here
app.get('/', function(req, res) {
	res.redirect('/home');
});

app.get('/login', function(req, res) {
	res.sendFile(path.join(__dirname, '/src/html/connection.html'));
});

app.use(express.static('src/css'))
app.use(express.static('src/js'))
app.use(express.static('src/assets'))
app.use(express.static('node_modules'))

app.get('/home', function(req, res) {
	res.sendFile(path.join(__dirname, '/src/html/home.html'));
});

app.get('/import', function(req, res) {
	res.sendFile(path.join(__dirname, '/src/html/import.html'));
});

app.get('/export/', function(req, res) {
	res.sendFile(path.join(__dirname, '/src/html/export.html'));
});

app.get('/recap', function(req, res) {
	res.sendFile(path.join(__dirname, '/src/html/recap.html'));
});

app.listen(port);

module.exports = app;