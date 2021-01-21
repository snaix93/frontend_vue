const SUCCESS_STATE = 'succeeded';
const FAILED_STATE = 'failed';

export default {
  methods: {
    useJobmonResultStatus_statusColor(status) {
      if (status.toLowerCase() === SUCCESS_STATE) return 'success';

      if (status.toLowerCase() === FAILED_STATE) return 'error';

      return 'primary';
    },
    useJobmonResultStatus_statusFromJob({stderr}) {
      if(!stderr)
        return SUCCESS_STATE;
      else if(
        typeof stderr === 'string'
        && stderr.length > 0
      )
        return FAILED_STATE;
      else
        return SUCCESS_STATE;
    },
  },
};