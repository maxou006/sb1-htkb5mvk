const express = require('express');
const router = express.Router();
const { getAnnonces, saveAnnonce } = require('../services/annonceService');
const { importLeboncoinAnnonces } = require('../services/importService');
const { logError } = require('../utils/logger');

router.get('/', (req, res) => {
  try {
    const annonces = getAnnonces();
    res.render('index', { annonces });
  } catch (error) {
    logError('GET /', error);
    res.status(500).render('error', { error: 'Une erreur est survenue lors du chargement des annonces' });
  }
});

router.post('/import-leboncoin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }

    const annonces = await importLeboncoinAnnonces(email, password);
    res.json(annonces);
  } catch (error) {
    logError('POST /import-leboncoin', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'import: ' + error.message 
    });
  }
});

module.exports = router;