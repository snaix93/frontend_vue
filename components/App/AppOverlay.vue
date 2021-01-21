<template>
  <transition name="fade">
    <div
      v-if="appOverlay"
      class="app-overlay"
    />
  </transition>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    computed: {
      ...mapState('app', ['appOverlay']),
    },
  };
</script>

<style lang="stylus" scoped>
  .app-overlay
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    background: rgba(0, 0, 0, 0.75)
    z-index: 4
</style>
