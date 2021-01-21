<template>
  <AppSnackbar
    :color="snackbar.color"
    :snackbar.sync="snackbar.open"
    @on-close="onClose"
  >
    {{ snackbar.msg }}
  </AppSnackbar>
</template>

<script>
  import AppSnackbar from '@/components/App/AppSnackbar';

  export default {
    components: { AppSnackbar },
    data() {
      return {
        snackbar: { color: '', msg: '', open: false },
        running: false,
      };
    },
    computed: {
      snackStack() {
        return this.$flash.getSnackStack();
      },
      nextSnack() {
        return this.$flash.getNextSnack();
      },
    },
    watch: {
      'snackStack': {
        handler() {
          if (this.nextSnack) {
            this.handleSnack(this.nextSnack);
          }
        },
        deep: true,
      }
    },
    methods: {
      handleSnack(snack) {
        if (this.running) return;
        this.running = true;
        this.showSnack(snack);
      },
      showSnack(snack) {
        this.snackbar.color = snack.color;
        this.snackbar.msg = snack.msg;
        this.snackbar.open = true;
      },
      onClose() {
        this.running = false;
        this.$flash.shiftOffQueue();
      },
    },
  };
</script>
