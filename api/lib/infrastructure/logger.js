const settings = require('../config');

const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');
const jsonFormat = bunyanFormat({ outputMode: 'json', jsonIndent: 2 });

const logger = bunyan.createLogger({ name: 'pix-api' });

if (settings.logging.enabled) {

  logger.addStream({
    name: 'json-format',
    stream: jsonFormat,
    level: settings.logging.logLevel,
  });

  logger.debug('DEBUG logs enabled');
  logger.trace('TRACE logs enabled');
}

module.exports = logger;
