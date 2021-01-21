import Model from '@/models/Model';

export default class WebCheck extends Model {
  static className = 'WebCheck';
  static filters = {
    ...this.defaultFilters,
  };
  static attributes = {
    path: '/',
    protocol: 'http',
    method: 'GET',
    expectedHttpStatus: 200,
    expectedPatternPresence: 'present',
    checkInterval: 90,
    active: true,
    timeOut: 15,
  };

  get isPreflighting() {
    return !! this.preflight;
  }

  static validationRules(options = {}) {
    if (! options.pathMaxLength) options.pathMaxLength = 254;

    return {
      path: `max:${options.pathMaxLength}|regex:^(?!https?://).*`,
      expectedPattern: 'min:1|max:75',
      expectedHttpStatus: 'required|integer|min:1|max_value:598',
      timeOut: 'required|decimal|max_value:60',
      checkInterval: 'required|integer',
      port: 'numeric|port',
      httpHeaders: [],
    };
  }

  static async createFromWizard({ url, preflight }) {
    let { data } = await this.$http.$post('/wizard/web-check', { url, preflight });
    return new WebCheck(data);
  }
}
