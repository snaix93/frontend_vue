<template>
  <form
    data-cy="authForm"
    name="authForm"
    @submit.prevent="onSubmit"
  >
    <BackendValidationAlert/>
    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.email') | capitalize"
      :rules="validationRules.email"
      data-cy="emailFormGroup"
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
    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.password') | capitalize"
      :rules="validationRules.password"
      data-cy="passwordFormGroup"
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
      :disabled="$wait.is($WAIT_FOR.AUTH.LOGIN)"
      :loading="$wait.is($WAIT_FOR.AUTH.LOGIN)"
      class="ml-0"
      color="primary"
      large
      type="submit"
    >
      <slot/>
    </v-btn>
  </form>
</template>

<script>
  import useBackendValidation from '@/mixins/useBackendValidation';
  import usePasswordField from '@/mixins/usePasswordField';
  import useAuth from '@/mixins/useAuth';

  export default {
    mixins: [
      useBackendValidation,
      usePasswordField,
      useAuth
    ],
    props: {
      prefilledEmail: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        email: '',
        password: '',
        validationRules: {
          email: 'required|email',
          password: 'required|min:7',
        },
      };
    },
    mounted() {
      if (this.prefilledEmail) {
        this.email = this.prefilledEmail;
      }
    },
    destroyed() {
      this.$wait.end(this.$WAIT_FOR.AUTH.LOGIN);
    },
    methods: {
      async onSubmit() {
        this.useBackendValidation_reset();
        const result = await this.$validator.validateAll();
        if (! result) return;

        await this.useAuth_login({
          email: this.email,
          password: this.password,
        }).catch(({ response }) => {
          this.useBackendValidation_renderAnyErrors(response, {
            403: this.$t('auth.wrongCredentials'),
          }, this.$t('auth.aTemporaryErrorHasHappened'));
        });
      },
    },
  };
</script>
