/* eslint-disable */
/**
  Command Line Arguments
*/

const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  { name: 'de', alias: 'd', type: Boolean },
  { name: 'es', alias: 'e', type: Boolean },
  { name: 'pt', alias: 'p', type: Boolean },
  { name: 'all', alias: 'a', type: Boolean },
];

const options = commandLineArgs(optionDefinitions);

const { langs } = require('./config');

const translateToFile = require('./translateToFile');

/**
  Select languages to translate based on
  command line arguments
*/

let selectedLangs = [];

if (options.all) {
  selectedLangs = Object.keys(langs).map(key => langs[key]);
} else {
  Object.keys(langs).forEach((key) => {
    if (options[key]) selectedLangs.push(langs[key]);
  });
}

/**
  Translate files
*/

(async () => {
  for (const lang of selectedLangs) {
    console.info(`Starting \x1b[32m${lang.iso}\x1b[0m...`);

    let dots = '';

    const loader = setInterval(() => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Translating \x1b[32m${lang.iso}\x1b[0m${dots}`);

      dots += '.';

      if (dots === '....') dots = '';
    }, 250);

    await translateToFile(lang.short, lang.iso);

    clearInterval(loader);

    console.info(`\nFinished \x1b[32m${lang.iso}\x1b[0m...`);
  }
})();
