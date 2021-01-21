<template>
  <v-fade-transition appear>
    <v-layout
      v-if="wait"
      fill-height
      column
      align-center
      justify-center
      ma-0
      class="wait-overlay"
      :style="`height: ${height}; background: rgba(250, 250, 250, ${opacity});`"
    >
      <v-progress-circular
        indeterminate
        :color="color"
        :size="small? '20' : '32'"
        :width="small? '2' : '3'"
      />
      <div
        v-if="!hideMessage"
        :class="[
          small ? 'caption mt-1' : 'body-2 mt-3',
          color !== 'secondary' ? `${color}--text` : 'grey--text text--darken-2'
        ]"
      >
        <slot>{{ $t('message.wait.default') | capitalize }}</slot>
        ...
      </div>
    </v-layout>
  </v-fade-transition>
</template>

<script>
  export default {
    props: {
      wait: {
        type: Boolean,
        default: false,
      },
      small: {
        type: Boolean,
        default: false,
      },
      hideMessage: {
        type: Boolean,
        default: false,
      },
      opacity: {
        type: String,
        required: false,
        default: '0.75',
      },
      color: {
        type: String,
        required: false,
        default: 'secondary',
      },
      height: {
        type: String,
        required: false,
        default: '100vh',
      }
    },
  };
</script>

<style lang="stylus" scoped>
  .wait-overlay
    position: absolute
    z-index 2
    top: 0
    left: 0
    width: 100%
    margin: 0 !important;
</style>
