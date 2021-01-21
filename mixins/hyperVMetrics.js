import filesize from 'filesize';

export default {
  methods: {
    filesize(value) {
      return filesize(value);
    },
    healthStateColor(state) {
      if (state.toLowerCase() === 'ok') return 'success';

      return 'primary';
    },
    heartBeatColor(state) {
      if (state.toLowerCase() === 'ok') return 'success';

      return 'grey';
    },
    stateColor(state) {
      if (state.toLowerCase() === 'running') return 'success';

      if (state.toLowerCase() === 'shutdown') return 'error';

      return 'grey';
    },
  },
};
