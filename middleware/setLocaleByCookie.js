import Cookie from 'js-cookie';
import { Validator } from 'vee-validate';

export default function ({ app: { i18n }, $config }) {
  const i18nCookie = Cookie.get($config.i18nCookie);

  if (!!i18nCookie) {
    const locales = i18n.locales.map(({ code }) => code);
    const i = locales.indexOf(i18nCookie);

    if (i > -1) {
      const lang = locales[i];

      i18n.locale = lang;
      Validator.localize(lang);
    }
  }
}
