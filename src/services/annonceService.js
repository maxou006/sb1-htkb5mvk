let annonces = [];

function getAnnonces() {
  return annonces;
}

function saveAnnonce(annonce) {
  annonce.id = Date.now();
  annonce.dateCreation = new Date().toISOString();
  annonces.push(annonce);
  return annonce;
}

module.exports = {
  getAnnonces,
  saveAnnonce
};