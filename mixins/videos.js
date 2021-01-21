export default {
  methods: {
    playVideo(video) {
      this.$bus.$emit('playVideo', video);
    }
  },
};
