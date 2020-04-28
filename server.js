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
      response.status(200).render('pages/index.ejs', {books:books,});
    });
});

function Book(data) {
  this.title = data.volumeInfo.title;
}

// search form
app.get('/searchForm', (request, response) => {
  response.status(200).render('pages/search-form');
});



// Force error
app.get('/error', () => {
  throw new Error('shit broke');
});

// 404
// app.use('*', (request, response) => {
//   console.log(request);
//   response.status(404).send('Sorry, can\'t find', request.pathname);
// });

// Error handler
app.use( (error, request, response) => {
  console.log(error);
  response.status(500).send(error.message);
});

// Start Server
function startServer() {
  app.listen( PORT, () => console.log('Server running on', PORT));
}

startServer();
