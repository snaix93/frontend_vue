/* eslint-disable */

export default ({ app, store, $config }) => {

  /*
    SETUP
  */
  window['dataLayer'] = window['dataLayer'] || [];

  // Google Tags Manager Snippet
  const GTM_ID = $config.gtmId;

  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window, document, 'script', 'dataLayer', GTM_ID);

  // Start Session
  window['dataLayer'].push({
    event: 'gtm.js', 'gtm.start': new Date().getTime(),
  });

  function gtag(){window.dataLayer.push(arguments);}

  /*
    TRACKING
  */

  // Track User Hosts
  const trackHostCount = (mutation) => {
    const totalHosts = mutation.payload;
    window.dataLayer.push({ totalHosts });

    gtag('config', GTM_ID, {
      totalHosts
    });
  }

  // Track User
  const trackAuthInit = (mutation) => {
    const user = mutation.payload.value;

    if(user.team) {
      const user_id = user.team.id;
      const email = user.email;

      window.dataLayer.push({ user_id , email });
      gtag('config', GTM_ID, { user_id , email });
    }
  }

  // Track Register EMail
  const trackRegisterEmail = (mutation) => {
    const email = mutation.payload;

    window.dataLayer.push({ email });
    gtag('config', GTM_ID, { email });
  }

  // Track Verified
  const trackVerified = (mutation) => {
    const verified = mutation.payload;

    window.dataLayer.push({ verified });
    gtag('config', GTM_ID, { verified });
  }

  // Track Route Change
  const trackRouteChange = (mutation) => {
    window.dataLayer.push({
      event: 'Pageview',
      pagePath: mutation.payload,
      pageTitle: document.title,
    });
  }

  const mutationLookup = {
    'hosts/setTotalHostCount': trackHostCount,
    'auth/SET': trackAuthInit,
    'register/setEmail': trackRegisterEmail,
    'register/setVerified': trackVerified,
    'app/setCurrentRoute': trackRouteChange,
  };

  store.subscribe((mutation, state) => {
     try {
       const handler = mutationLookup[mutation.type];
       if (handler) handler(mutation);
     } catch(error) {
       // Fail silently
     }
   });

}
