<template>
  <form
    name="title"
    @submit.prevent="onSubmit"
  >
    <BackendValidationAlert/>
    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.nickname') | capitalize"
      :rules="validationRules.nickname"
      class="mb-2"
      validation-key="nickname"
    >
      <template #default="prop">
        <v-text-field
          v-model="nickname"
          v-validate="prop.rules"
          :append-icon="nickname && !prop.firstErrorMessage ? fieldStateIcon(nickname && !prop.firstErrorMessage) : 'person'"
          :data-vv-name="prop.validationKey"
          :error-messages="prop.firstErrorMessage"
          :hint="$t('form.hint.optional')"
          :label="prop.label"
          :success="nickname && !prop.firstErrorMessage"
          color="grey darken-3"
          data-vv-validate-on="blur"
          outline
          persistent-hint
          type="text"
        />
      </template>
    </VeeFormGroup>
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
    <VeeFormGroup validation-key="termsAccepted">
      <template>
        <v-checkbox
          v-model="termsAccepted"
          class="mt-0 mb-4"
          hide-details
        >
          <template #label>
            <div>
              <span
                class="caption"
                v-html="$t('register.iAgreeToTheTermsAndConditions', {
                  ...legalLinks,
                  cssClass: 'font-weight-bold secondary--text no-text-decoration'
                })"
              >
              </span>
            </div>
          </template>
        </v-checkbox>
      </template>
    </VeeFormGroup>
    <v-btn
      :disabled="$wait.is($WAIT_FOR.AUTH.SIGNUP)"
      class="ml-0"
      color="primary"
      dark
      large
      type="submit"
    >
      <v-wait :for="$WAIT_FOR.AUTH.SIGNUP">
        <template #waiting>
          <v-progress-circular
            :size="20"
            :width="2"
            indeterminate
          />
        </template>
        <slot/>
      </v-wait>
    </v-btn>
  </form>
</template>

<script>
  import { mapState } from 'vuex';
  import registerMixins from '@/mixins/register';
  import usePasswordField from '@/mixins/usePasswordField';
  import useBackendValidation from '@/mixins/useBackendValidation';

  export default {
    mixins: [registerMixins, usePasswordField, useBackendValidation],
    data() {
      return {
        nickname: null,
        password: '',
        termsAccepted: false,
        privacyAccepted: false,
        validationRules: {
          nickname: 'max:100',
          password: 'required|min:7',
        },
      };
    },
    computed: {
      ...mapState('app', ['legalLinks'])
    },
    watch: {
      termsAccepted(value) {
        this.privacyAccepted = value;
      },
    },
    methods: {
      async onSubmit() {
        this.useBackendValidation_reset();
        const result = await this.$validator.validateAll();
        if (! result) return;

        const payload = {
          email: this.$route.params.email,
          id: this.$route.params.id,
          signature: this.$route.query.signature,
          password: this.password,
          termsAccepted: this.termsAccepted,
          privacyAccepted: this.privacyAccepted,
          nickname: this.nickname,
        };

        this.$wait.start(this.$WAIT_FOR.AUTH.SIGNUP);
        this.$axios
            .$post('/auth/join-team', payload)
            .then(() => {
              this.$emit('on-success');
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response, {
                403: this.$t('auth.alreadyAuthenticated'),
              }, this.$t('auth.aTemporaryErrorHasHappened'));
            })
            .finally(() => {
              this.$wait.end(this.$WAIT_FOR.AUTH.SIGNUP);
            });
      },
    },
  };
</script>
