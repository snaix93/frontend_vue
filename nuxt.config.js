/* eslint-disable */
import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin';
import pkg from './package';

require('events').EventEmitter.defaultMaxListeners = 50;
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');

const meta = [
  { charset: 'utf-8' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  { hid: 'description', name: 'description', content: pkg.description },
  {
    name: 'msapplication-TileColor',
    content: '#00518d',
  },
  {
    name: 'msapplication-config',
    content: '/favicons/browserconfig.xml',
  },
  {
    name: 'theme-color',
    content: '#ffffff',
  },
];

if (process.env.ENVIRONMENT !== 'PROD') {
  const commitHash = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString().trim();

  meta.push({
    name: 'build',
    content: commitHash,
  });
}

export default {
  ssr: false,

  server: {
    port: 3333,
    host: '0.0.0.0',
  },

  loadingIndicator: {
    name: 'fading-circle',
    color: 'white',
    background: '#00518d',
  },

  head: {
    title: pkg.name,
    meta,
    link: [
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/favicons/apple-touch-icon.png?v=wAd7jGaRgY',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicons/favicon-32x32.png?v=wAd7jGaRgY',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicons/favicon-16x16.png?v=wAd7jGaRgY',
      },
      {
        rel: 'manifest',
        href: '/favicons/site.webmanifest?v=wAd7jGaRgY',
      },
      {
        rel: 'mask-icon',
        href: '/favicons/safari-pinned-tab.svg?v=wAd7jGaRgY',
        color: '#5bbad5',
      },
      {
        rel: 'shortcut icon',
        href: '/favicons/favicon.ico?v=wAd7jGaRgY',
      },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Montserrat:400,600|PT+Serif:400,400i,700|Material+Icons&display=swap',
      },
      {
        rel: 'stylesheet',
        integrity: 'sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf',
        crossorigin: 'anonymous',
        href: 'https://use.fontawesome.com/releases/v5.8.1/css/all.css',
      },
    ],
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#1976d2' },

  /*
   ** Global CSS
   */
  css: [
    'animate.css/animate.min.css',
    '@/assets/style/cloudradar.styl',
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/axios',
    '@/plugins/vuetify',
    '@/plugins/vee-validate',
    '@/plugins/vue-filters',
    '@/plugins/vue-flag-icons',
    '@/plugins/event-bus',
    '@/plugins/flash',
    '@/plugins/wait',
    '@/plugins/tooltips',
    '@/plugins/vue-api-query',
    '@/plugins/vue-clipboard',
    '@/plugins/vue-tiptap-editor',
    '@/plugins/refresher',
    { src: '~plugins/tracking.js', ssr: false },
    { src: '~/plugins/vuex-persist', ssr: false },
  ],

  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/robcresswell/nuxt-compress
    'nuxt-compress',
    '@nuxtjs/sentry',
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    // Doc: https://dev.auth.nuxtjs.org/
    '@nuxtjs/auth-next',
    // Doc: https://nuxt-community.github.io/nuxt-i18n/
    [
      'nuxt-i18n',
      {
        parsePages: false,
        locales: [
          {
            code: 'en',
            iso: 'en-GB',
            name: 'English',
            file: 'en-GB.js',
          },
          {
            code: 'de',
            iso: 'de-DE',
            name: 'Deutsch',
          },
          {
            code: 'es',
            iso: 'es-ES',
            name: 'Español',
          },
          {
            code: 'pt',
            iso: 'pt-PT',
            name: 'Português',
          },
        ],
        defaultLocale: 'en',
        vueI18n: {
          fallbackLocale: 'en',
          messages: {
            en: require('./lang/en-GB').default,
            de: require('./lang/de-DE').default,
            es: require('./lang/es-ES').default,
            pt: require('./lang/pt-PT').default,
          },
        },
        lazy: true,
        langDir: 'lang/',
      },
    ],
    // Doc: https://github.com/f/vue-wait#readme
    'vue-wait/nuxt',
    // Doc: https://portal-vue.linusb.org/
    'portal-vue/nuxt',
    '@nuxtjs/redirect-module',
  ],

  wait: {
    useVuex: true,
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
    publishRelease: true,
    attachCommits: true,
    repo: 'cloudradar/frontend_v3',
    sourceMapStyle: 'hidden-source-map',
    tracing: process.env.ENVIRONMENT === 'PROD' ? {
      tracesSampleRate: 0.2,
    } : false,
    config: {
      environment: process.env.ENVIRONMENT === 'PROD' ? 'production' :
                   (process.env.ENVIRONMENT === 'DEV' ? 'development' : 'staging'),
    },
  },

  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    https: process.env.API_HTTPS,
    proxy: process.env.API_PROXY,
    credentials: true,
  },

  // If proxy option on axios options is false, then this won't do anything.
  proxy: {
    '/api': {
      target: process.env.API_URL,
      secure: false,
      pathRewrite: { '^/api': '' },
    },
  },

  auth: {
    strategies: {
      'laravelJWT': {
        provider: 'laravel/jwt',
        url: !! process.env.API_PROXY
             ? `${process.env.APP_URL}${process.env.API_PREFIX}`
             : process.env.API_URL,
        endpoints: {
          login: { url: '/auth/login', method: 'post' },
          logout: { url: '/auth/logout', method: 'post' },
          refresh: { url: '/auth/refresh', method: 'post' },
          user: { url: '/user', method: 'get' },
        },
        user: {
          property: 'data',
        },
        token: {
          property: 'token',
          maxAge: 3600 // 1 hour in seconds
        },
        refreshToken: {
          property: 'token',
          maxAge: 1209600, // 2 weeks in seconds
        },
      },
    },
    redirect: {
      login: '/auth',
      logout: '/auth',
      callback: false,
      home: false,
    },
    plugins: [
      '@/plugins/hydrate-auth-models',
      '@/plugins/entity-settings',
    ],
  },

  /*
   ** Router Configuration
   */
  router: {
    trailingSlash: false,
    extendRoutes(routes) {
      routes.push({
        name: 'inviteRegister',
        path: '/register/invitation/:code/:email?',
        component: 'pages/register/_state.vue',
      });
    },
  },

  redirect: [
    {
      // eslint-disable-next-line
      from: '(?!^\/$|^\/[?].*$)(.*\/[?](.*)$|.*\/$)',
      to: (from, req) => {
        const base = req._parsedUrl.pathname.replace(/\/$/, '');
        const search = req._parsedUrl.search;
        return base + (search != null ? search : '');
      }
    },
    { from: '^/reset-password/(.*)/(.*)$', to: '/password/reset/$1/$2', statusCode: 301 },
    { from: '^/forgot-password$', to: '/password/forgot', statusCode: 301 },
  ],

  /*
   ** Build configuration
   */
  build: {
    // extractCSS: true,
    transpile: ['vuetify/lib'],
    plugins: [
      new VuetifyLoaderPlugin(),
      // https://github.com/iamakulov/moment-locales-webpack-plugin
      new MomentLocalesPlugin(
        // add locales to this array in order to keep them in the final bundle
        { localesToKeep: ['de', 'es', 'pt'] },
      ),
      // https://github.com/gilmoreorless/moment-timezone-data-webpack-plugin
      new MomentTimezoneDataPlugin({
        startYear: 2018,
      }),
    ],

    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Web Worker support
      // @see https://github.com/nuxt/nuxt.js/pull/3480#issuecomment-404150387
      config.output.globalObject = 'this';

      if (ctx.isClient) {
        config.module.rules.push({
          test: /\.worker\.js$/,
          use: { loader: 'worker-loader' },
          exclude: /(node_modules)/,
        });
      }
    },

    optimization: {
      splitChunks: {
        chunks: 'all',
        maxSize: 250000,
      },
    },

    babel: {
      plugins: [
        '@babel/plugin-proposal-nullish-coalescing-operator',
        ['@babel/plugin-proposal-private-methods', { 'loose': true }]
      ]
    }
  },

  /*
   ** Environment variables - DEFAULTS
   ** Change values in .env file (see README)
   */
  publicRuntimeConfig: {
    environment: process.env.ENVIRONMENT || 'DEV',
    gtmId: process.env.GTM_ID || 'GTM-N2VBVKB',
    kbBasePath: process.env.KB_BASE_PATH || 'https://docs.cloudradar.io/',
    wwwBasePath: process.env.WWW_BASE_PATH || 'https://www.cloudradar.io',
    i18nCookie: process.env.I18N_COOKIE || 'i18n_cookie',
    baseURL: process.env.API_URL || 'https://core.cloudradar.io',
    hubUrl: process.env.HUB_URL || 'https://hub.cloudradar.io',
  },
  privateRuntimeConfig: {
    //
  },
};
