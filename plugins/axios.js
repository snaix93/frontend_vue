
const CHART_REQUEST_TIMEOUT_IN_SECONDS = 12/*seconds*/,
      AVAILABLE_CHARTS_REQUEST_TIMEOUT_IN_SECONDS = 12/*seconds*/;

export default function ({ app: { i18n }, $axios }) {
  $axios.onRequest((request) => {
    if (request.url?.includes('/graph-data/')) {
      request.timeout = CHART_REQUEST_TIMEOUT_IN_SECONDS * 1000;
    }

    if (request.url?.endsWith('/keys')) {
      request.timeout = AVAILABLE_CHARTS_REQUEST_TIMEOUT_IN_SECONDS * 1000;
    }

    request.headers['Content-Language'] = i18n?.locale ?? 'en';
  });

  $axios.onResponseError((error) => {
    if (error.config?.url.includes('/graph-data/') && error.message?.includes('timeout of')) {
      error.timedOut = true;
    }
  });

  $axios.onError((error) => {
    const code = parseInt(error.response && error.response.status);
    const url = String(error.response && error.response.config.url);

    if (
      !String(window.location).includes('/auth')
      && !url.startsWith('https://api.telegram.org')
      && code === 401
    ) {
      window.location = '/auth';
    }
  });
}
