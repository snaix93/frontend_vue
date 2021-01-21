/* eslint-disable */
const { Storage } = require('@google-cloud/storage');
const { TranslationServiceClient } = require('@google-cloud/translate').v3beta1;

const {
 BUCKET, PROJECT_ID, LOCATION, langs,
} = require('./config');

const translationClient = new TranslationServiceClient();
const storage = new Storage();

console.info('Starting setup...');

// Lists all buckets in the current project
console.info(`Searching for bucket: \x1b[32m${BUCKET}\x1b[0m...`);
storage.getBuckets().then(async ([buckets]) => {
  let bucket = buckets.find(bucket => bucket.name === BUCKET);

  /**
    STORAGE
  */

  // Create bucket if it does not exist
  if (!bucket) {
    console.info('Creating new bucket...');
    bucket = await storage.createBucket(BUCKET, {
      location: 'EU',
    });
    console.info('Bucket has been created!');
  } else {
    console.info('Found bucket!');
  }

  // Upload local glossary file to bucket
  console.info('Uploading glossary file...');
  const result = await storage.bucket(BUCKET)
                              .upload('./misc/utility/translate/glossary.csv', {});
  console.info('Uploading done.');

  /**
    GLOSSARY
  */
  const name = translationClient.glossaryPath(PROJECT_ID, LOCATION, 'glossary');

  // Delete old glossary of fail silently
  try {
    console.info('Attempting to delete old glossary...');
    await translationClient.deleteGlossary({ name });
    console.info('Old glossary was deleted!');
  } catch (e) { }

  // Construct glossary
  const glossary = {
    name,
    languageCodesSet: {
      languageCodes: [
        'en',
        ...Object.keys(langs),
      ],
    },
    inputConfig: {
      gcsSource: {
        inputUri: `gs://${BUCKET}/glossary.csv`,
      },
    },
  };

  // Construct request
  const request = {
    parent: translationClient.locationPath(PROJECT_ID, LOCATION),
    glossary,
  };

  // Create glossary
  console.info('Creating glossary...');
  const [operation] = await translationClient.createGlossary(request);

  // Wait for operation to complete.
  await operation.promise();
  console.info('Glossary created!');

  console.info('Setup finished!');
});
