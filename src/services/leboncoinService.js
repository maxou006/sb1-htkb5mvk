const puppeteer = require('puppeteer');
const { logInfo, logError } = require('../utils/logger');

const SELECTORS = {
  EMAIL: '#email',
  PASSWORD: '#password',
  SUBMIT: '[type="submit"]',
  ANNONCE_CONTAINER: '[data-qa-id="aditem_container"]',
  ANNONCE_TITLE: '[data-qa-id="aditem_title"]',
  ANNONCE_PRICE: '[data-qa-id="aditem_price"]',
  ANNONCE_DATE: '[data-qa-id="aditem_date"]'
};

const URLS = {
  LOGIN: 'https://auth.leboncoin.fr/login/',
  MES_ANNONCES: 'https://www.leboncoin.fr/mes-annonces'
};

async function initBrowser() {
  try {
    logInfo('initBrowser', 'Démarrage du navigateur...');
    
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--no-zygote'
      ],
      ignoreHTTPSErrors: true,
      timeout: 90000
    });

    logInfo('initBrowser', 'Navigateur démarré avec succès');
    return browser;
  } catch (error) {
    logError('initBrowser', error);
    throw new Error(`Erreur d'initialisation du navigateur: ${error.message}`);
  }
}

async function createPage(browser) {
  try {
    const page = await browser.newPage();
    await page.setDefaultTimeout(60000);
    await page.setDefaultNavigationTimeout(60000);
    
    // Intercepter les requêtes d'images et de styles pour optimiser
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    return page;
  } catch (error) {
    logError('createPage', error);
    throw new Error('Erreur lors de la création de la page');
  }
}

async function login(page, email, password) {
  try {
    logInfo('login', 'Navigation vers la page de connexion...');
    await page.goto(URLS.LOGIN, { waitUntil: 'networkidle0' });
    
    logInfo('login', 'Attente du formulaire de connexion...');
    await page.waitForSelector(SELECTORS.EMAIL, { visible: true });
    
    logInfo('login', 'Remplissage des identifiants...');
    await page.type(SELECTORS.EMAIL, email, { delay: 100 });
    await page.type(SELECTORS.PASSWORD, password, { delay: 100 });
    
    logInfo('login', 'Soumission du formulaire...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click(SELECTORS.SUBMIT)
    ]);
    
    logInfo('login', 'Connexion réussie');
  } catch (error) {
    logError('login', error);
    throw new Error('Échec de la connexion: ' + error.message);
  }
}

async function extractAnnonces(page) {
  try {
    logInfo('extractAnnonces', 'Navigation vers la page des annonces...');
    await page.goto(URLS.MES_ANNONCES, { waitUntil: 'networkidle0' });
    
    logInfo('extractAnnonces', 'Attente du chargement des annonces...');
    await page.waitForSelector(SELECTORS.ANNONCE_CONTAINER, { visible: true });
    
    const annonces = await page.evaluate((selectors) => {
      const items = document.querySelectorAll(selectors.ANNONCE_CONTAINER);
      return Array.from(items).map(item => ({
        titre: item.querySelector(selectors.ANNONCE_TITLE)?.textContent.trim() || 'Sans titre',
        prix: item.querySelector(selectors.ANNONCE_PRICE)?.textContent.trim() || 'Prix non spécifié',
        url: item.querySelector('a')?.href || '',
        dateCreation: item.querySelector(selectors.ANNONCE_DATE)?.textContent.trim() || ''
      }));
    }, SELECTORS);
    
    logInfo('extractAnnonces', `${annonces.length} annonces trouvées`);
    return annonces;
  } catch (error) {
    logError('extractAnnonces', error);
    throw new Error('Impossible de récupérer les annonces: ' + error.message);
  }
}

async function getLeboncoinAnnonces(email, password) {
  let browser = null;
  let page = null;
  
  try {
    browser = await initBrowser();
    page = await createPage(browser);
    
    await login(page, email, password);
    const annonces = await extractAnnonces(page);
    
    return annonces;
  } catch (error) {
    throw error;
  } finally {
    if (page) await page.close().catch(err => logError('closePage', err));
    if (browser) await browser.close().catch(err => logError('closeBrowser', err));
  }
}

module.exports = { getLeboncoinAnnonces };