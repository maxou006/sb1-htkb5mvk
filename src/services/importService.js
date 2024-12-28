const { getLeboncoinAnnonces } = require('./leboncoinService');
const { saveAnnonce } = require('./annonceService');
const { logInfo, logError } = require('../utils/logger');

async function importLeboncoinAnnonces(email, password) {
  try {
    logInfo('importService', 'Début de l\'import des annonces');
    
    const annonces = await getLeboncoinAnnonces(email, password);
    
    // Sauvegarder chaque annonce
    for (const annonce of annonces) {
      saveAnnonce(annonce);
    }
    
    logInfo('importService', `${annonces.length} annonces importées avec succès`);
    return annonces;
  } catch (error) {
    logError('importService', error);
    throw new Error('Échec de l\'import des annonces: ' + error.message);
  }
}

module.exports = { importLeboncoinAnnonces };