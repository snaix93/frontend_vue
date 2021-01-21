<template>
  <v-layout fill-height row wrap>
    <v-flex
      v-for="item in items"
      :key="`${item}_key`"
      :lg4="isMini"
      :lg6="isTile"
      :sm6="isMini"
      :xl3="isMini"
      :xl4="isTile"
      py-0
      xs12
    >
      <content-loader
        :height="loaderHeight"
        :speed="5"
        preserve-aspect-ratio="none"
        primary-color="#eeeeee"
        secondary-color="#e0e0e0"
      />
    </v-flex>
  </v-layout>
</template>

<script>
  import { ContentLoader } from 'vue-content-loader';
  import { DASHBOARD_VIEWS } from '@/constants/dashboard';

  export default {
    components: {
      ContentLoader,
    },
    props: {
      display: {
        type: String,
        required: true,
      },
      itemCount: {
        type: [Number, Boolean],
        required: false,
        default: false,
      },
      itemHeight: {
        type: [Number, Boolean],
        required: false,
        default: false,
      }
    },
    computed: {
      loaderHeight() {
        if (this.itemHeight) return this.itemHeight;
        switch (this.display) {
          case DASHBOARD_VIEWS.CARD_MEDIUM:
            return 100;
          case DASHBOARD_VIEWS.CARD_MINI:
            return 83;
          case DASHBOARD_VIEWS.LIST:
            return 11.1;
          default:
            return 150;
        }
      },
      items() {
        if (this.itemCount) {
          return [...Array(this.itemCount).keys()];
        }

        switch (this.display) {
          case DASHBOARD_VIEWS.CARD_MEDIUM:
            return 4;
          case DASHBOARD_VIEWS.LIST:
            return 6;
          default:
            return 12;
        }
      },
      isTile() {
        return this.display === DASHBOARD_VIEWS.CARD_MEDIUM;
      },
      isMini() {
        return this.display === DASHBOARD_VIEWS.CARD_MINI;
      },
      isList() {
        return this.display === DASHBOARD_VIEWS.LIST;
      },
    },
  };
</script>
