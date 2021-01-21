import BackendValidationAlert from '@/components/App/BackendValidationAlert';
import {
  resetBackendValidationErrors,
  renderAnyErrors
} from '@/use/useBackendValidation';

export default {
  components: { BackendValidationAlert },
  methods: {
    useBackendValidation_renderAnyErrors(response, errorMessagesByCode = null, defaultMessage = null) {
      return renderAnyErrors(response, errorMessagesByCode, defaultMessage);
    },
    useBackendValidation_reset() {
      resetBackendValidationErrors();
    },
  },
};
