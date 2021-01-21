import useDateTime from '@/mixins/useDateTime';

const PRIVATE = 'private';
const PUBLIC = 'public';
const INVALID = 'invalid';

export default {
  mixins: [useDateTime],
  data() {
    return {
      _connectType: null,
      _origConnectType: null,
      _frontmanConsideredConnectedInSecs: 300,
    };
  },
  computed: {
    hostLocation_connectType() {
      return this.$data._connectType;
    },
    hostLocation_connectIsPrivate() {
      return this.$data._connectType === PRIVATE;
    },
    hostLocation_connectIsPublic() {
      return this.$data._connectType === PUBLIC;
    },
    hostLocation_connectIsInvalid() {
      return this.$data._connectType === INVALID;
    },
    hostLocation_connectIsUnchecked() {
      return this.$data._connectType === null;
    },
    hostLocation_originalConnectIsPublic() {
      return this.$data._origConnectType === PUBLIC;
    },
  },
  methods: {
    hostLocation_setConnectType(connectType) {
      this.$data._connectType = connectType;
    },
    hostLocation_isFrontmanConnected(Frontman) {
      if (! Frontman?.lastHeartbeatAt?.timestamp) {
        return false;
      }
      return (
        this.getTimeDiffFromNow(Frontman.lastHeartbeatAt.timestamp, 'seconds')
        <= this.$data._frontmanConsideredConnectedInSecs
      );
    },
    async hostLocation_checkConnectType(Host) {
      if (! Host.connect) return;

      this.$wait.start(this.$WAIT_FOR.CONNECT_VALIDATION);
      Host.getConnectData()
          .then(({ type }) => {
            this.hostLocation_setConnectType(type);
          })
          .catch(({ response }) => {
            this.hostLocation_setConnectType(INVALID);
          })
          .finally(() => {
            if (this.isUpdatingHost && ! this._origConnectType) {
              this.$data._origConnectType = this.hostLocation_connectType;
            }
            this.$wait.end(this.$WAIT_FOR.CONNECT_VALIDATION);
          });
    },
    hostLocation_resetConnectType() {
      this.hostLocation_setConnectType(null);
    },
    hostLocation_setOriginalConnectType(connectType) {
      this.$data._origConnectType = connectType;
    },
    hostLocation_resetConnectTypeToOriginal() {
      this.hostLocation_setConnectType(this._origConnectType);
    }
  },
};
