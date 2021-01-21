<template>
  <v-img
    :src="logoImage"
    alt="CloudRadar"
    contain
    height="35"
    :width="drawerMini ? 56 : 216"
    position="left center"
    class="v-image--logo pointer"
    :class="{'hidden-sm-and-down' : size === 'md'}"
    @click="goTo(link)"
  >
    <v-layout
      v-if="!drawerMini"
      fill-height align-center
    >
      <v-flex
        pl-5
        v-html="logoText"
      />
    </v-layout>
  </v-img>
</template>

<script>
  /* eslint-disable global-require */
  import { mapState } from 'vuex';

  export default {
    props: {
      link: {
        type: Object,
        required: false,
        default: () => ({
          to: '/dashboard',
          type: 'nuxt',
        }),
      },
      size: {
        type: String,
        required: false,
        default: 'md',
      },
    },
    computed: {
      ...mapState('app', ['appDrawer', 'appDrawerMini']),
      drawerMini() {
        return this.appDrawerMini;
      },
      logoImage() {
        return require('@/static/images/brand/cloudradar_logo_dark.svg');
      },
      logoText() {
        return `<span class="v-image--logo__text v-image--logo__text--${this.size} font-primary"><span>Cloud</span>Radar</span>`;
      },
    },
    methods: {
      goTo(link) {
        if (link.type === 'nuxt') {
          return this.$router.push(link.to);
        }
        window.location = link.to;

        return link.to;
      },
    },
  };
</script>

<style lang="stylus">
  .v-image--logo__text
    text-transform: uppercase
    font-weight: 700
    letter-spacing: .14em
    color: var(--v-secondary-darken2)
    &--lg
      font-size: 18px
    span:first-child
      color: var(--v-secondary-lighten3)
</style>
