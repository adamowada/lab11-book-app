'use strict';

require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT;
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);  //add heroku database url
const methodOverride = require('method-override');


app.use( express.urlencoded({extended:true,}));
app.use( express.static('./public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));



// Routes


// on load index.ejs
app.get('/newsearch', (request, response) => {
  response.status(200).render('pages/searches/new.ejs');
});


// new search new.ejs
app.post('/search', (request, response) => {
  const url = 'https://www.googleapis.com/books/v1/volumes';
  let queryObj = {
    q: `${request.body.searchby}: ${request.body.search}`,
  };
  superagent.get(url)
    .query(queryObj)
    .then(results => {
      let books = results.body.items.map(book => new Book(book));
      response.status(200).render('pages/searches/show.ejs', {books,});
    });
});

function Book(data) {
  const imagePlaceholder = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors;
  this.isbn = data.volumeInfo.industryIdentifiers[0].identifier;
  this.description = data.volumeInfo.description ? data.volumeInfo.description : 'Read the book to find out.';
  this.image = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : imagePlaceholder;
  this.bookshelf = 'default';
  this.amount = data.saleInfo.listPrice ? data.saleInfo.listPrice.amount : ' Unknown.';
}

// saved books
app.get('/', (request, response) => {
  const SQL = 'SELECT * FROM books';
  client.query(SQL)
    .then (results => {
      response.status(200).render('pages/index.ejs', {books:results.rows,});
    })
    .catch ( error => {
      throw new Error('error happened fool!', error);
    });
});

// add new book to database
app.post('/add', (request, response) => {
  const SQL = `
    INSERT INTO books (author, title, isbn, image_url, _description, bookshelf, amount)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const VALUES = [
    request.body.author,
    request.body.title,
    request.body.isbn,
    request.body.image_url,
    request.body._description,
    request.body.bookshelf,
    request.body.amount
  ];
  client.query(SQL, VALUES)
    .then( () => {
      response.status(200).redirect('/');
    })
    .catch( error => {
      console.error(error.message);
    });
});

// delete book from database
app.post('/delete/:id',(request,response) => {
  let id = request.body.id;
  const SQL = 'DELETE FROM books WHERE id=$1';
  let VALUES = [id];
  // console.log(request.body.id);
  client.query(SQL, VALUES)
    .then( () => {
      response.status(200).redirect('/');
    })
    .catch( error => {
      console.error(error.message);
    });
});

// Update book

app.put('/update-book/:id', (request, response) => {
  const SQL = 'UPDATE books SET author = $1, title = $2, isbn = $3, image_url = $4, _description = $5, bookshelf = $6, amount = $7 WHERE id = $8';
  const VALUES = [
    request.body.author,
    request.body.title,
    request.body.isbn,
    request.body.image_url,
    request.body._description,
    request.body.bookshelf,
    request.body.amount,
    request.body.id
  ];
  client.query(SQL, VALUES)
    .then( () => {
      response.status(200).redirect(`/`);
    })
    .catch( error => {
      console.error(error.message);
    });
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
  response.status(500).render('pages/500', {error,});
});

// Start Server
function startServer(PORT) {
  app.listen( PORT, () => console.log('Books app Server running on', PORT));
}

client.connect()
  .then( () => {
    startServer(PORT);
  })
  .catch( error => console.error(error.message));
