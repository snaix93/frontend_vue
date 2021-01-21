<template>
  <div>
    <template v-if="!success">
      <form
        name="title"
        @submit.prevent="onSubmit"
      >
        <BackendValidationAlert/>
        <VeeFormGroup
          :error-bag="validationErrors"
          :label="$t('form.field.email') | capitalize"
          :rules="validationRules.email"
          validation-key="email"
        >
          <template #default="prop">
            <v-text-field
              v-model="email"
              v-validate="prop.rules"
              :data-vv-name="prop.validationKey"
              :error-messages="prop.firstErrorMessage"
              :label="prop.label"
              append-icon="mail_outline"
              color="grey darken-3"
              data-vv-validate-on="blur"
              outline
            />
          </template>
        </VeeFormGroup>
        <v-btn
          :disabled="$wait.is($WAIT_FOR.AUTH.FORGOT)"
          class="ml-0"
          color="primary"
          large
          type="submit"
        >
          <v-wait :for="$WAIT_FOR.AUTH.FORGOT">
            <template #waiting>
              <v-progress-circular
                :size="20"
                :width="2"
                color="secondary"
                indeterminate
              />
            </template>
            <slot/>
          </v-wait>
        </v-btn>
      </form>
    </template>
    <template v-if="success">
      <div>
        <v-img
          :alt="$t('auth.passwordReset')"
          :src="require('@/assets/paperplane.png')"
          contain
          max-height="120"
          position="left center"
        />
        <p class="mt-4 mb-4">
          {{ $t('auth.passwordReset') }}
        </p>
      </div>
    </template>
  </div>
</template>

<script>
  import useBackendValidation from '@/mixins/useBackendValidation';

  export default {
    mixins: [useBackendValidation],
    data() {
      return {
        email: '',
        success: null,
        validationRules: {
          email: 'required|email',
        },
      };
    },
    destroyed() {
      this.$wait.end(this.$WAIT_FOR.AUTH.FORGOT);
    },
    methods: {
      async onSubmit() {
        this.useBackendValidation_reset();
        const result = await this.$validator.validateAll();
        if (! result) return;

        this.$wait.start(this.$WAIT_FOR.AUTH.FORGOT);
        this.$axios.$post('/auth/recovery', { email: this.email })
            .then(() => {
              this.success = true;
            })
            .catch(({ response }) => {
              this.$wait.end(this.$WAIT_FOR.AUTH.FORGOT);
              this.useBackendValidation_renderAnyErrors(response);
            });
      },
    },
  };
</script>
