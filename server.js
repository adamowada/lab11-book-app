'use strict';

require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
app.use( express.urlencoded({extended:true}));
app.use( express.static('./public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (request, response) => {
  response.status(200).send('Helllooooooooo') 
});

app.get('/sports', (request, response) => {
  const data = {
    name: request.query.team,
    sport: request.query.sport,
    numbers: [request.query.numberOne, request.query.numberTwo],
    players: ['Russell', 'Greg'],
  };

  response.status(200).render('sports.ejs', {sports:data});
})


app.post('/player', (request, response) => {
  response.status(200).render('player', {player:request.body.bio});
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
