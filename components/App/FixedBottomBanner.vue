<template>
  <div
    class="fixed-bottom-banner"
    :class="{ mini: appDrawerMini }"
  >
    <slot/>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'FixedBottomBanner',
    computed: {
      ...mapState('app', ['appDrawerMini']),
    }
  };
</script>

<style scoped lang="stylus">
  .fixed-bottom-banner {
    transition: all 0.2s;
    position: fixed;
    left: 0;
    right: 0;
    bottom: -16px;
    z-index: 10;
    margin: 0 0 0 240px;

    &.mini {
      margin-left: 80px;
    }
  }
</style>
