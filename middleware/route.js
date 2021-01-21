export default function ({ store, route }) {
  store.dispatch('app/setCurrentRoute', route.path);
}
