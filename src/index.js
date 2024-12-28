const express = require('express');
const bodyParser = require('body-parser');
const annoncesRoutes = require('./routes/annonces');
const path = require('path');
const { logInfo } = require('./utils/logger');

const app = express();
const PORT = 3000;

// Configuration des vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/', annoncesRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Démarrage du serveur
app.listen(PORT, () => {
  logInfo('server', `Serveur démarré sur http://localhost:${PORT}`);
});