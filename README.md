
## Build Setup

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate

# run before committing to git
$ npm run precommit
```

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).

## Dev setup

#### .env file
This file holds the global environment variables for the frontend, such as IDs or API keys as well as info about the environment the application is running in (DEV, TEST, PROD).
If no .env file is present, the environment variables in `nuxt.config.js` kick in to always provide a running DEV application.
Copy and paste `.env.example`, rename it to `.env` and adjust the values if necessary.

#### Tips
``` bash
# to quickly clear out node_modules and reinstall from lock file:
$ npm ci

# run before committing to git (and fix errors before commiting)
$ npm run precommit
```

#### Data Refresher

The data refresher mixin is applied to certain page components to trigger periodic data refreshes to the store etc. If means the user doesn't have to update the frontend to see fresh data. However when developing it can getHosts in the way at times. Therefore it can be controlled via your local .env file with the following variable:

```
 * Switch off entirely (no refreshing will occur at all)
 * REFRESHER_OFF=true
```

It's important that your .env file stays out of the git repo. It has been added to the .gitignore file to ensure this always remains the case :)

#### Translation

##### Setup
1. Create a service account and make it available (via an environment variable or otherwise) to the app (<https://cloud.google.com/docs/authentication/getting-started>)

2. Create a Cloud Storage bucket with the name `cloudradar-translation`. You can choose a different name, just remember to set it via the .env (`TRANSLATION_BUCKET`).

3. Create a new project under: <https://console.cloud.google.com/projectcreate>

4. Set your project's ID as a .env var (`GOOGLE_PROJECT_ID`)

5. Make the cloud translation API available to the project: <https://console.cloud.google.com/apis/library/translate.googleapis.com>

6. Run `npm run translate-setup` to complete the setup. This will create the glossary and will prepare it for the translation.

##### Translation

Translate to available languages: `npm run translate`

Translate to German: `npm run translate-de`

Translate to Spanish: `npm run translate-es`

Translate to Portuguese: `npm run translate-pt`

##### About the glossary
> A glossary is a custom dictionary the Cloud Translation API uses to consistently translate the customer's domain-specific terminology. This typically involves specifying how to translate a named entity. For example, the glossary provides a translation for "Google Summer of Code," "Gmail confidential mode," or "placement performance report." Glossaries can be used with AutoML models or the Google model.

The glossary is located under `/misc/deployment/utility/translate/glossary.csv`

<https://cloud.google.com/translate/docs/glossary>

For further options take a look at `.env.example`

## Dev Modules
Modules only needed for development or build time (`buildModules` option in `nuxt.config.js`) - this was introduced with Nuxt v2.9., therefore not all of the suitable modules have been adapted to dev modules, yet.
### @nuxtjs/dotenv
Loads the .env file into the application context and process.env - see [@nuxtjs/dotenv docs](https://github.com/nuxt-community/dotenv-module#readme)

## Modules
### @nuxtjs/axios
A secure and easy [Axios](https://github.com/axios/axios) integration with Nuxt.js to make HTTP requests - see [@nuxtjs/axios docs](https://axios.nuxtjs.org/)
### nuxt-compress
A simple static asset compression module for Nuxt that runs Gzip and Brotli compression during the build process - see [nuxt-compress docs](https://github.com/robcresswell/nuxt-compress)
### @nuxtjs/proxy
The one-liner node.js http-proxy middleware solution for Nuxt.js using http-proxy-middleware - see [@nuxtjs/proxy docs](https://github.com/nuxt-community/proxy-module#readme)
### nuxt-i18n 
Provides i18n features with integrated [vue-i18n](https://github.com/kazupon/vue-i18n) - see [nuxt-i18n docs](https://nuxt-community.github.io/nuxt-i18n/)
### vue-wait
The module helps with multiple process loader management - see [vue-wait docs](https://github.com/f/vue-wait)
### portal-vue
The module provides a set of two components that allow you to render a component's template (or a part of it) anywhere in the document - see [portal-vue docs](https://linusborg.github.io/portal-vue/#/guide)

## 3rd-party Plugins

* *Vuetify* - a Material Design Component Framework - see [Vuetify docs](https://vuetifyjs.com/en/getting-started/quick-start)
* *VeeValidate* - input validation for Vue.js  [vee-validate docs](https://baianat.github.io/vee-validate/)

## Connecting a local frontend to the staging backend

A local backend is not necessarily needed for frontend development. The staging backend available at https://v2.cloudradar.info/engine/ can be used.

> Never use absolute URL for ajax request in the frontend.

Frontend and backend will be delivered under the same url using the same webserver instance. This avoids so called cors problems and several instances can be spawned easily.
The drawback of this approach is that a local running frontend using the node-based development server will not connect to a remote backend. A local proxy is needed, which makes the frontend and the remote backend available under the same domain.

Any webserver can be used, [caddy](https://caddyserver.com/) is a simple and easy to install option. Caddy does not require any installation and it's available for nearly any operation system.

[Download caddy](https://caddyserver.com/download) without special plugins.
Create a config file `cloudradar-frontend.conf` anywhere:
```
http://localhost:8080/engine/ {
    proxy / https://v2.cloudradar.info/engine/
    log /tmp/caddy.log
    errors /tmp/caddy.log
    root /tmp
}
http://localhost:8080 {
    root /tmp
    proxy / http://localhost:3000
    log /tmp/caddy.log
    errors /tmp/caddy.log
}
```
Depending on your operating system you might have to change the log and the root directory.

This is a simple routing proxy which passed requests for http://localhost:8080 to different backends according to the url-path.

Start the webserver

    caddy -conf cloudradar-frontend.conf

and access the local running frontend through http://localhost:8080

The remote backend is available through http://localhost:8080/engine

To request for example a list of hosts do not use `https://v2.cloudradar.info/engine/hosts`
Use `/hosts` instead.

**good:**
```javascript
async getHosts ({commit}) {
    const res = await this.$axios.$getHosts('/hosts/')
    commit('setHosts', res.hosts)
  },
```

**bad**:
```
async getHosts ({commit}) {
    const res = await this.$axios.$getHosts('http://localhost:8080/engine/hosts/')
    commit('setHosts', res.hosts)
  },
```

**worse**:
```javascript
async getHosts ({commit}) {
    const res = await this.$axios.$getHosts('https://v2.cloudradar.info/engine/hosts/')
    commit('setHosts', res.hosts)
  },
```


Don't use `engine` in urls as this prefix as globally configured as base url for the backend. (See nuxt.config.js)
```javascript
axios: {
    // See https://github.com/nuxt-community/axios-module#options
    browserBaseURL: '/engine'
  },
```
