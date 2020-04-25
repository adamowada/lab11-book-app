'use strict';

require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
app.use( express.urlencoded({extended:true}));
app.use( express.static('./public'));

// Routes
app.get('/', (request, response) => {
  response.status(200).send('Helllooooooooo') 
});

app.get('/sports', (request, response) => {
  response.status(200).send(`I hear you like sports. Your favorite team is the ${request.query.team} and they play ${request.query.sport}.`);
})

app.post('/player', (request, response) => {
  const res = `${request.body.name}'s Bio Is: ${request.body.bio}`;
  response.status(200).send(res);
});

// Force error
app.get('/error', () => {
  throw new Error('shit broke');
});

// 404
app.use('*', (request, response) => {
  console.log(request);
  response.status(404).send('Sorry, can\'t find', request.pathname);
})

// Error handler
app.use( (error, request, response) => {
  console.log(error);
  response.status(500).send(error.message);
})

// Start Server
function startServer() {
  app.listen( PORT, () => console.log('Server running on', PORT));
}

startServer();
