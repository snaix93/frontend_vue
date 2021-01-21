<template>
  <v-dialog
    v-model="pickerDialog"
    max-width="220px"
    hide-overlay
    lazy
  >
    <SketchPicker
      v-model="color"
      style="margin: 0 auto;"
    />
  </v-dialog>
</template>

<script>
  import { Sketch as SketchPicker } from 'vue-color';

  export default {
    components: {
      SketchPicker,
    },
    props: {
      value: {},
      dialog: {
        type: Boolean,
        required: true,
      },
    },
    computed: {
      pickerDialog: {
        get() {
          return this.dialog;
        },
        set() {
          this.$emit('on-close');
        },
      },
      color: {
        get() {
          return this.value.hex || this.value;
        },
        set(value) {
          this.$emit('input', value.hex);
        },
      },
    },
  };
</script>
