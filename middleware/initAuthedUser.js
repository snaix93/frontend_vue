import Cookie from 'js-cookie';
import { Validator } from 'vee-validate';

export default function (context) {
  const { $auth, app, $config, route } = context;

  const User = $auth.user;
  const entryPoint = Cookie.get('entryPoint');

  if (!! User.id && !! User.lang) {
    const userLocale = User.lang;

    if (!! userLocale) {
      app.i18n.locale = userLocale;
      Validator.localize(userLocale);
      Cookie.set($config.i18nCookie, userLocale);
    }
  }

  /*
  * ONBOARD:
  * If user just signed up or basic settings are incomplete, then send to onboarding flow.
  */
  if (! route.path.includes('onboard') && User.needsOnboarding()) {
    return app.router.push('/onboard');
  }

  if (entryPoint && entryPoint[0] === '/') {
    Cookie.remove('entryPoint');
    app.router.push(entryPoint);
  }

  if (
    $auth.loggedIn
    && User.onFrozenPlan()
    && route.path !== '/'
    && ! route.path.includes('dashboard')
    && ! route.path.includes('settings')
  ) {
    app.context.next('/settings');
  }
}
