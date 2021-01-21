<template>
  <v-fade-transition mode="out-in">
    <v-container
      v-if="$wait.is(blanketWait)"
      class="app-blanket"
      fluid
    >
      <v-layout align-center justify-center>
        <v-flex class="white--text text-xs-center headline">
          <AppWait :wait="true" color="white" opacity="0">
            <slot>{{ appBlanketMessage }}</slot>
          </AppWait>
        </v-flex>
      </v-layout>
    </v-container>
  </v-fade-transition>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import AppWait from '@/components/App/AppWait';

  export default {
    components: { AppWait },
    computed: {
      ...mapState('app', ['appBlanketMessage']),
      blanketWait() {
        return [
          this.$WAIT_FOR.APP.BLANKET,
        ];
      }
    },
    watch: {
      blanketWait(shown) {
        if (shown) {
          document.documentElement.style.overflow = 'hidden';
          document.body.scroll = 'no';
        } else {
          document.documentElement.style.overflow = 'scroll';
          document.body.scroll = 'yes';
        }
      }
    },
    beforeDestroy() {
      this.setAppBlanketMessage();
      document.documentElement.style.overflow = 'scroll';
      document.body.scroll = 'yes';
    },
    methods: {
      ...mapMutations('app', ['setAppBlanketMessage']),
    }
  };
</script>

<style lang="stylus" scoped>
  .app-blanket {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0
    left: 0
    margin: 0 auto;
    overflow: hidden
    z-index: 4
    background: var(--v-secondary-base);
  }
</style>
