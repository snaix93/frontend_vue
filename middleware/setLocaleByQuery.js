import Cookie from 'js-cookie';
import { intersection } from 'lodash-es';
import { Validator } from 'vee-validate';

export default function ({ app: { i18n }, route, $config }) {
  const queries = Object.keys(route.query);

  if (queries.length) {
    const locales = i18n.locales.map(({ code }) => code);
    const [lang] = intersection(locales, queries);

    if (lang) {
      i18n.locale = lang;
      Validator.localize(lang);
      Cookie.set($config.i18nCookie, lang);
    }
  }
}
