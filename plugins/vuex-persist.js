import VuexPersistence from 'vuex-persist';

export default ({ store }) => {
  window.onNuxtReady(() => {
    new VuexPersistence({
      modules: ['hostCharts'],
    }).plugin(store);
  });
}
