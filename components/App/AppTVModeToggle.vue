<template>
  <v-btn
    v-if="isVisible"
    :class="{ active: TVMode }"
    :title="label | capitalize"
    class="tv-mode--toggle mx-0"
    flat
    ripple
    style="min-width: 45px;"
    @click="onClick"
  >
    <v-icon v-if="TVMode">tv_off</v-icon>
    <v-icon v-else>tv</v-icon>
  </v-btn>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';

  const DocumentElement = document.documentElement;

  export default {
    computed: {
      ...mapState('dashboard', ['TVMode']),
      ...mapState('app', ['appDrawer', 'appToolbar', 'appFooter']),
      isVisible() {
        if (this.TVMode) return true;
        if (this.$vuetify.breakpoint.mdAndUp) return true;
        return false;
      },
      label() {
        return this.TVMode ? this.$t('app.exitTVMode') : this.$t('app.TVMode');
      }
    },
    methods: {
      ...mapMutations('dashboard', ['toggleTVMode']),
      ...mapMutations('app', ['toggleAppDrawer', 'toggleAppToolbar', 'toggleAppFooter']),
      onClick() {
        const exitHandler = () => {
          if (! document.fullscreenElement && ! document.webkitIsFullScreen && ! document.mozFullScreen && ! document.msFullscreenElement) {
            disable();
          }
        };

        const disable = () => {
          setTimeout(this.disableFullScreen, 250);
          document.body.classList.remove('tv-mode');
          this.toggleTVMode(false);
          this.toggleAppDrawer(true);
          this.toggleAppToolbar(true);
          this.toggleAppFooter(true);
          document.removeEventListener('fullscreenchange', exitHandler);
          document.removeEventListener('webkitfullscreenchange', exitHandler);
          document.removeEventListener('mozfullscreenchange', exitHandler);
          document.removeEventListener('MSFullscreenChange', exitHandler);
        };

        const enable = () => {
          setTimeout(this.enableFullScreen, 250);
          document.body.classList.add('tv-mode');
          this.toggleTVMode(true);
          this.toggleAppDrawer(false);
          this.toggleAppToolbar(false);
          this.toggleAppFooter(false);
          document.addEventListener('fullscreenchange', exitHandler);
          document.addEventListener('webkitfullscreenchange', exitHandler);
          document.addEventListener('mozfullscreenchange', exitHandler);
          document.addEventListener('MSFullscreenChange', exitHandler);
        };

        if (this.TVMode) {
          disable();
        } else {
          enable();
        }
      },
      disableFullScreen() {
        if (
          document.fullscreenElement
          || document.mozFullScreenElement
          || document.webkitFullscreenElement
          || document.msFullscreenElement
        ) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.mozCancelFullScreen) {
            /* Firefox */
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) {
            /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            /* IE/Edge */
            document.msExitFullscreen();
          }
        }
      },
      enableFullScreen() {
        if (DocumentElement.requestFullscreen) {
          DocumentElement.requestFullscreen().catch(err => {
            // console.error(err);
          });
        } else if (DocumentElement.mozRequestFullScreen) {
          /* Firefox */
          DocumentElement.mozRequestFullScreen();
        } else if (DocumentElement.webkitRequestFullscreen) {
          /* Chrome, Safari and Opera */
          DocumentElement.webkitRequestFullscreen();
        } else if (document.msRequestFullscreen) {
          /* IE/Edge */
          DocumentElement.msRequestFullscreen();
        }
      }
    },
  };
</script>

<style lang="stylus" scoped>
  .tv-mode--toggle
    transition: all 0.5s ease-out

    &.active
      opacity: 0.75
</style>
