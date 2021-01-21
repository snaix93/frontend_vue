/* eslint-disable */
require('dotenv').config();

module.exports = {
  BUCKET: process.env.TRANSLATION_BUCKET || 'cloudradar-translation',
  PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
  LOCATION: process.env.GOOGLE_LOCATION || 'us-central1',
  SOURCE_DIR: process.env.TRANSLATION_SOURCE_DIR || '../../../lang',
  DESTINATION_DIR: process.env.TRANSLATION_DESTINATION_DIR || 'lang',

  langs: {
    de: {
      short: 'de',
      iso: 'de-DE',
    },
    es: {
      short: 'es',
      iso: 'es-ES',
    },
    pt: {
      short: 'pt',
      iso: 'pt-PT',
    },
  },
};
