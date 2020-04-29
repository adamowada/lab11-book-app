'use strict';

require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT;
const app = express();
const superagent = require('superagent');
app.use( express.urlencoded({extended:true,}));
app.use( express.static('./public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (request, response) => {
  response.status(200).render('pages/searches/new.ejs');
});

// new.ejs
app.post('/search', (request, response) => {
  const url = 'https://www.googleapis.com/books/v1/volumes';
  let queryObj = {
    q: `${request.body.searchby}: ${request.body.search}`,
  };
  superagent.get(url)
    .query(queryObj)
    .then(results => {
      let books = results.body.items.map(book => new Book(book));
      response.status(200).render('pages/index.ejs', {books});
    });
});

function Book(data) {
  const imagePlaceholder = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors;
  this.description = data.volumeInfo.description ? data.volumeInfo.description : 'Read the book to find out.';
  this.image = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : imagePlaceholder;
  this.amount = data.saleInfo.listPrice ? data.saleInfo.listPrice.amount : ' Unknown.';
}

// search form
app.get('/searchForm', (request, response) => {
  response.status(200).render('pages/search-form');
});



// Force error
app.get('/error', () => {
  throw new Error('shit broke');
});

// 404 Not Found
app.use('*', (request, response) => {
  response.status(404).render('pages/404');
});

// 500 Error handler
app.use( (error, request, response, next ) => {
  response.status(500).render('pages/500', {error});
});

// Start Server
function startServer() {
  app.listen( PORT, () => console.log('Server running on', PORT));
}

startServer();
