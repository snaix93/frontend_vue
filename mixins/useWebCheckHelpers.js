export default {
  methods: {
    useWebCheckHelpers_formattedPath(path) {
      if (!path || path.trim() === '') {
        return '/';
      }
      return `/${path.replace(/^\/+/g, '').trim()}`;
    },
    useWebCheckHelpers_urlPreview(WebCheck, Host) {
      let urlPreview = `${WebCheck.protocol}://${Host.connect}`;

      if (WebCheck.port) {
        urlPreview += `:${WebCheck.port}`;
      }

      urlPreview += this.useWebCheckHelpers_formattedPath(WebCheck.path);

      return urlPreview;
    },
  },
};
