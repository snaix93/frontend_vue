<template>
  <v-snackbar
    :color="color"
    :value="snackbarOpen"
    :timeout="0"
  >
    <slot/>
    <v-btn
      flat
      @click="onClose"
    >
      {{ $t('button.close') }}
    </v-btn>
  </v-snackbar>
</template>

<script>
  export default {
    props: {
      snackbar: {
        type: Boolean,
        required: true,
      },
      color: {
        type: String,
        required: false,
      },
    },
    data() {
      return {
        snackbarOpened: this.snackbar,
        snackbarTimer: null,
      };
    },
    computed: {
      snackbarOpen: {
        get() {
          return this.snackbar;
        },
        set(newValue) {
          this.snackbarOpened = newValue;
        },
      },
    },
    watch: {
      snackbarOpen() {
        clearTimeout(this.snackbarTimer);

        if (this.snackbarOpen) {
          this.snackbarTimer = setTimeout(() => {
            if (this.snackbarOpen) this.onClose();
          }, 4000);
        }
      },
    },
    methods: {
      onClose() {
        this.snackbarOpen = false;
        setTimeout(() => {
          this.$emit('on-close');
        }, 150);
        this.$emit('update:snackbar', this.snackbarOpened);
      },
    },
  };
</script>
