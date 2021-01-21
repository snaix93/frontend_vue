<template>
  <v-dialog
    v-model="dialog"
    max-width="1160px"
    @click.outside="onCancel"
  >
    <v-card>
      <v-card-title class="py-1">
        <v-spacer/>
        <v-btn
          icon
          @click.stop="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="text-xs-center pt-0">
        <div id="__video"/>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
  import Player from '@vimeo/player';
  import { mapMutations } from 'vuex';

  export default {
    computed: {
      dialog: {
        get() {
          return this.$store.getters['videos/videoDialog']
        },
        set(value) {
          if(!value) {
            this.hideVideoDialog();
          } else {
            this.showVideoDialog();
          }
        }
      }
    },
    mounted() {
      this.$bus.$on('playVideo', (videoId) => {
        this.__playVideo(videoId);
      })
    },
    methods: {
      ...mapMutations('videos', ['showVideoDialog', 'hideVideoDialog']),
      __playVideo(videoId, videoWidth = 1100) {
        const player = new Player(document.getElementById('__video'), {
          id: videoId,
          width: videoWidth,
        });

        const unwatch = this.$watch('dialog', (val) => {
          if (!val) {
            player.destroy();
            unwatch();
          }
        });

        this.showVideoDialog();
        player.play();
      },
      onCancel() {
        this.hideVideoDialog();
      },
    }
  }
</script>
