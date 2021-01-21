<template>
  <v-btn
    color="primary"
    class="play-video-button"
    :class="{
      'ma-0' : !!block
    }"
    small
    :block="!!block"
    round
    depressed
    @click="playVideo(video)"
  >
    <v-icon
      left
      :dark="!icon"
    >
      play_circle_filled
    </v-icon>
    <template v-if="!icon">
      Tutorial
    </template>
    <span
      v-if="!!duration"
      class="duration"
      :class="{
        'with-label' : !icon
      }"
    >
      {{ duration }}
    </span>
  </v-btn>
</template>
<script>
  import videoMixins from '@/mixins/videos';

  export default {
    mixins: [videoMixins],
    props: {
      video: {
        type: String,
        required: true,
      },
      duration: {
        type: String,
        required: false,
      },
      icon: {
        type: Boolean,
        required: false,
        default: false
      },
      block: {
        type: Boolean,
        required: false,
        default: false
      }
    },
  }
</script>
<style lang="stylus" scoped>
  .play-video-button.v-btn
    min-width: 0;

  .duration
    display: inline-block;
    font-size: 11px;
    text-transform: none;
    font-weight: bold;
    color: white;
    border-radius: 2000px;

    &.with-label
      margin: 0 0 0 6px;
      padding: 1px 6px 0 6px;
      border: 1px solid white;
</style>
