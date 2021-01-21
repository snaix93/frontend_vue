export default ({ store }, inject) => {
  inject('tooltip', key => () => {
    const $content = {
      get: () => store.state.tooltips[key],
      fetch: () => store.dispatch(`tooltips/${key}`),
    };

    return new Promise(async (resolve) => {
      try {
        let content = $content.get();

        if (content === null) {
          await $content.fetch();
          content = $content.get();
        }

        resolve(content);
      } catch (error) {
        resolve('Something went wrong fetching this tooltip. Sorry.');
      }
    });
  });
};
