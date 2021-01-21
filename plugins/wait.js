import { WAIT_FOR } from '@/constants/wait';

export default ({ store }, inject) => {
  inject('WAIT_FOR', WAIT_FOR);
  let withoutWaiting = false;
  inject('dispatchWait', {
    start(key) {
      if (withoutWaiting) return;
      store.dispatch('wait/start', key, { root: true });
    },
    end(key) {
      if (withoutWaiting) return;
      store.dispatch('wait/end', key, { root: true });
    },
    async withoutWaiting(callback) {
      withoutWaiting = true;
      await callback();
      withoutWaiting = false;
    }
  });
};
