<template>
  <form
    name="title"
    @submit.prevent="onSubmit"
  >
    <BackendValidationAlert/>
    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.password') | capitalize"
      :rules="validationRules.password"
      class="mb-2"
      validation-key="password"
    >
      <template #default="prop">
        <v-text-field
          v-model="password"
          v-validate="prop.rules"
          :append-icon="usePasswordField_appendIcon"
          :data-vv-name="prop.validationKey"
          :error-messages="prop.firstErrorMessage"
          :label="prop.label"
          :success="usePasswordField_passwordSuccessState"
          :type="usePasswordField_passwordFieldType"
          color="grey darken-3"
          data-vv-validate-on="blur"
          outline
          @blur="usePasswordField_onPasswordEnter"
          @click:append="usePasswordField_togglePasswordFieldType"
        />
      </template>
    </VeeFormGroup>
    <v-btn
      :disabled="$wait.is($WAIT_FOR.AUTH.RESET)"
      class="ml-0"
      color="primary"
      large
      type="submit"
    >
      <v-wait :for="$WAIT_FOR.AUTH.RESET">
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

<script>
  import useBackendValidation from '@/mixins/useBackendValidation';
  import usePasswordField from '@/mixins/usePasswordField';
  import registerMixins from '@/mixins/register';

  export default {
    mixins: [registerMixins, usePasswordField, useBackendValidation],
    data() {
      return {
        password: '',
        validationRules: {
          password: 'required|min:7',
        },
      };
    },
    destroyed() {
      this.$wait.end(this.$WAIT_FOR.AUTH.RESET);
    },
    methods: {
      async onSubmit() {
        this.useBackendValidation_reset();
        const result = await this.$validator.validateAll();
        if (! result) return;

        this.$wait.start(this.$WAIT_FOR.AUTH.RESET);
        this.$axios.$post('/auth/reset', {
              email: this.$route.params.email,
              token: this.$route.params.verificationToken,
              password: this.password,
            })
            .then(() => {
              this.$router.replace(`/password/reset/success?email=${this.$route.params.email}`);
            })
            .catch(({ response }) => {
              this.$wait.end(this.$WAIT_FOR.AUTH.RESET);
              this.useBackendValidation_renderAnyErrors(response, {
                403: this.$t('auth.tokenError'),
              }, this.$t('auth.aTemporaryErrorHasHappened'));
            });
      },
    },
  };
</script>
