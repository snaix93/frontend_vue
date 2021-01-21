<template>
  <v-alert
    :value="formattedErrors"
    class="mb-4"
    type="error"
    v-html="formattedErrors"
  />
</template>

<script>
  import { getBackendValidationErrors } from '@/use/useBackendValidation';

  export default {
    name: 'BackendValidationAlert',
    computed: {
      formattedErrors() {
        const errors = getBackendValidationErrors();
        return errors
          .map(error => error.replace(/([^.])$/, '$1.'))
          .when(errors.count() > 1, errors => errors.map(error => `${error}<br>`))
          .join('');
      }
    },
  };
</script>
