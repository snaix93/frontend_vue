import Vue from 'vue';

export default function (context, inject) {
  const capitalize = (value) => {
    if (! value) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const snackQueue = { stack: [] };

  inject('flash', {
    success(msg) {
      this.pushToQueue({ color: 'success', msg });
    },
    warning(msg) {
      this.pushToQueue({ color: 'warning', msg });
    },
    error(msg) {
      this.pushToQueue({ color: 'error', msg });
    },
    getSnackQueue() {
      return Vue.observable(snackQueue);
    },
    getSnackStack() {
      return this.getSnackQueue().stack;
    },
    getNextSnack() {
      return this.getSnackStack()?.[0] ?? null;
    },
    pushToQueue(snack) {
      snack.msg = capitalize(snack.msg);
      snackQueue.stack.push(snack);
    },
    shiftOffQueue() {
      snackQueue.stack.shift();
    }
  });
};
