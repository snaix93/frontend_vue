import { useRefresher } from '@/use/useRefresher';

export default (context, inject) => {
  inject('refresher', instanceName => useRefresher(instanceName));
};
