<template>
  <v-layout
    wrap
    justify-center
  >
    <v-flex
      v-for="(video, key) in helpVideos"
      :key="key"
      xs12
      md4
      class="px-3 mb-1"
    >
      <v-hover>
        <template #default="{ hover }">
          <v-card
            :class="[`elevation-${hover ? 4 : 2}`]"
            style="height:100%"
            @click="playVideo(video.videoId)"
          >
            <v-img
              :src="makeImagePath(video.videoId)"
              height="150px"
            >
              <div
                class="d-flex flex align-center play-video-button caption white--text py-1 px-2"
              >
                <v-icon
                  color="primary"
                  class="mr-1"
                  size="19"
                >
                  play_circle_filled
                </v-icon>
                <span
                  :data-cy="'playVideoButton_' + key"
                  class="font-weight-medium play-video-button--label">
                  {{ $t('dashboard.videos.clickToPlay') }}
                </span>
              </div>
            </v-img>

            <v-card-text>
              <p
                class="subheading font-weight-medium d-flex"
                :data-cy="'videoHeadline_' + key"
              >
                {{ $t(`dashboard.videos.${key}.headline`) | capitalize }}
              </p>

              <p>{{ $t(`dashboard.videos.${key}.description`) }}</p>

              <v-chip
                class="caption"
                small
              >
                {{ video.duration }}
              </v-chip>
            </v-card-text>
          </v-card>
        </template>
      </v-hover>
    </v-flex>
    <VideoDialog />


    <span id="ignore"/>
  </v-layout>
</template>

<script>
  /* eslint-disable global-require */
  import VideoDialog from '@/components/Videos/VideoDialog';

  import useDateTime from '@/mixins/useDateTime';
  import videoMixin from '@/mixins/videos';

  export default {
    components: { VideoDialog },
    mixins: [useDateTime, videoMixin],
    data() {
      return {
        videoEle: null,
        helpVideos: {
          linux: {
            videoId: '317997466',
            duration: '1m 31s',
          },
          windows: {
            videoId: '315920162',
            duration: '1m 35s',
          },
          internet: {
            videoId: '316390364',
            duration: '1m 39s',
          },
          frontman: {
            videoId: '325225008',
            duration: '1m 52s',
          },
          telegram: {
            videoId: '388662836',
            duration: '1m 45s',
          },
        },
      };
    },
    mounted() {
      this.videoEle = document.getElementById('helpVideos');
    },
    methods: {
      makeImagePath(videoId) {
        return require(`~/assets/images/help-video-thumb-${videoId}.png`);
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .v-card
    &:hover
      cursor pointer

      .play-video-button
        background: rgba(0, 0, 0, 0.3)

  .play-video-button
    position: absolute
    right: 0
    bottom: 0
    background: rgba(0, 0, 0, 0.5)
    border-top-left-radius: 4px
    transition: background 0.3s ease-in

    .v-icon
      align-items: center
</style>
