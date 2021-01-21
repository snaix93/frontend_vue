export default {
  computed: {
    useCheckIntervals_checkIntervals() {
      const minCheckInterval = this.$auth.team.minCheckInterval;

      return [
        { value: 60, disabled: minCheckInterval > 60 },
        { value: 90, disabled: minCheckInterval > 90 },
        { value: 180, disabled: minCheckInterval > 180 },
        { value: 300, disabled: minCheckInterval > 300 },
      ];
    },
  },
};