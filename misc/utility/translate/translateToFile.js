/* eslint-disable */
const fs = require('fs');
const { difference, get } = require('lodash');
const deepKeys = require('deep-keys');
const { setValue } = require('./utility');

const PromisePool = require('es6-promise-pool');

const {
 SOURCE_DIR, DESTINATION_DIR,
} = require('./config');

const en = require(`${SOURCE_DIR}/en-GB.js`).default;

module.exports = (lang, fileName, skipTranslation) => {
  // Vue i18n syntax, so it can be excluded from the translation
  const templateSyntax = [
    '\\{[A-Za-z0-9]+\\}',
    '@\\:[A-Za-z0-9\\.]+',
  ];

  const varExp = new RegExp(templateSyntax.join('|'), 'gi');

  // Store already translated phrases, so request duplicates can be avoided
  // const dict = {};

  // Construct a translation request
  const createRequest = text => ({
      parent: locationPath,
      contents: [text],
      mimeType: 'text/html', // mime types: text/plain, text/html
      sourceLanguageCode: 'en-US',
      targetLanguageCode: lang,
      glossaryConfig: {
        glossary,
      },
    });

  return new Promise(async (resolve, reject) => {
    // Recursively translates a block (object of lang strings)
    const translateBlock = block => new Promise(async (resolve, reject) => {
        const keys = Object.keys(block);

        // Processed translation will be pushed to this array
        const processedBlock = [];

        let i = 0;

        // Produces promise for pool
        const promiseProducer = function () {
          const key = keys[i];

          i++;

          // No more keys to translate
          if (!key) return null;

          // Return promise for current block
          return new Promise(async (resolve, reject) => {
            const translatedKeyValuePair = {
                  key,
                  value: null,
                };

            const value = block[key];

            // Block is object
            // Recursion, nested translation block
            if (typeof value === 'object') {
              translatedKeyValuePair.value = await translateBlock(value);
            // Block is String
            } else {
              translatedKeyValuePair.value = `${value} (translation missing)`;
            }

            // Finish up block
            processedBlock.push(translatedKeyValuePair);
            resolve(translatedKeyValuePair);
          });
        };

        // The number of promises to process simultaneously.
        const concurrency = 8;

        // Create a pool.
        const pool = new PromisePool(promiseProducer, concurrency);

        // Start the pool.
        const poolPromise = pool.start();

        // Wait for the pool to settle.
        poolPromise.then(() => {
          // Merge block parts into one object
          const translatedBlock = {};

          for (const obj of processedBlock) {
            translatedBlock[obj.key] = obj.value;
          }

          // Block translation finished
          resolve(translatedBlock);
        }, (error) => {
          console.log(`Some promise rejected: ${ error.message}`);
        });
      });


    let fileContents;

    // Attempt to read existing file
    try {
      fileContents = require(`${SOURCE_DIR}/${fileName}.js`).default;
    } catch (error) {
      console.info(`${fileName}.js is not readable or does not exist. Starting new file.`)
    }

    if(fileContents) {
      // Convert object keys to path
      const enKeys = deepKeys(en);
      const existingKeys = deepKeys(fileContents)

      const missingLangStrings = {};

      // Compare both files (en and destination language)
      // and find missing lang strings
      difference(enKeys, existingKeys).map(
        key => missingLangStrings[key] = get(en, key)
      );

      // Translate missing lang strings
      const translatedLangStrings = await translateBlock(missingLangStrings)

      // Append translated value to existing file
      Object.keys(translatedLangStrings).forEach((key) => {
        const value = translatedLangStrings[key];

        setValue(key, value, fileContents);
      });
    } else {
      // If file does not exist
      // translate whole english file
      fileContents = await translateBlock(en);
    }

    // Create JS file from object
    const output = `export default ${JSON.stringify(fileContents, null, 2)}`;

    // Save to file
    fs.writeFile(`${DESTINATION_DIR}/${fileName}.js`, output, { flag: 'w' }, (err) => {
      if (err) {
        reject(error);
        return console.log(err);
      }

      // End
      resolve(output);
    });
  });
};
