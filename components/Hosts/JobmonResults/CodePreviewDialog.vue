<template>
  <v-dialog
    scrollable
    persistent
    :value="value"
    max-width="1200px"
  >
    <v-card color="primary darken-2">
      <v-card-title class="py-2 primary--text text--lighten-1 primary darken-4">
        <span class="subheading">
          {{ code.name }}
        </span>
        <v-spacer/>
        <v-btn
          class="primary--text text--lighten-1"
          icon
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <div class="code">
        <kbd class="pa-3">{{ code.code }}</kbd>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: {
      value: {
        type: Boolean,
        required: true,
      },
      code: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {};
    },
    methods: {
      onCancel() {
        this.$emit('input', false)
      },
    },
  };
</script>
<style lang="stylus" scoped>
  .code
    max-width: 100%;
    overflow: auto;

    kbd
      white-space: pre
</style>
