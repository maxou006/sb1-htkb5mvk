function logError(location, error) {
  console.error(`[${location}] ${error.message}`);
  console.error(error.stack);
}

function logInfo(location, message) {
  console.log(`[${location}] ${message}`);
}

module.exports = { logError, logInfo };