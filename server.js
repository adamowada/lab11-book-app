

require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT;
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);  //add heroku database url

app.use( express.urlencoded({extended:true,}));
app.use( express.static('./public'));
app.set('view engine', 'ejs');




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
  this.description = data.volumeInfo.description ? data.volumeInfo.description : 'Read the book to find out.';
  this.image = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : imagePlaceholder;
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

// add new book
app.post('/add', (request, response) => {
  console.log(request.body);
  const SQL = `
    INSERT INTO books (author, title, isbn, image_url, _description, bookshelf)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const VALUES = [
    request.body.author,
    request.body.title,
    request.body.isbn,
    request.body.image_url,
    request.body._description,
    request.body.bookshelf
  ];
  client.query(SQL, VALUES)
    .then( () => {
      response.status(200).redirect('/');
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
