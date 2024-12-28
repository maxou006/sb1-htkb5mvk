const puppeteer = require('puppeteer');

async function createBrowser() {
  try {
    return await puppeteer.launch({ 
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
      timeout: 60000
    });
  } catch (error) {
    throw new Error(`Erreur lors du lancement du navigateur: ${error.message}`);
  }
}

module.exports = { createBrowser };