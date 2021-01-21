<template>
  <form
    class="position-relative"
    @submit.prevent="onSubmit"
  >
    <BackendValidationAlert/>
    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.email') | capitalize"
      :rules="validationRules.email"
      class="mb-2"
      validation-key="email"
    >
      <template #default="prop">
        <v-text-field
          id="email"
          v-model="email"
          v-validate="prop.rules"
          :append-icon="emailNotUsed !== null ? fieldStateIcon(emailNotUsed) : 'mail_outline'"
          :data-vv-as="prop.label"
          :data-vv-name="prop.validationKey"
          :error="emailNotUsed === false"
          :error-messages="emailFieldErrorMessage(prop.firstErrorMessage)"
          :label="prop.label"
          :success="(emailNotUsed && email.length > 0) === true"
          color="grey darken-3"
          data-vv-validate-on="blur"
          outline
          type="text"
        />
      </template>
    </VeeFormGroup>

    <VeeFormGroup
      v-if="showInvitationField"
      :error-bag="validationErrors"
      :label="$t('form.field.VIPPass') | capitalize"
      :rules="validationRules.invitationCode"
      class="mb-2"
      validation-key="invitationCode"
    >
      <template #default="prop">
        <v-text-field
          ref="invitationField"
          v-model="internalInvitationCode"
          v-validate="prop.rules"
          :append-icon="invitationCodeSuccessState !== null ? fieldStateIcon(invitationCodeSuccessState) : 'card_giftcard'"
          :data-vv-as="prop.label"
          :data-vv-name="prop.validationKey"
          :error-messages="prop.firstErrorMessage"
          :label="prop.label"
          :success="invitationCodeSuccessState"
          color="grey darken-3"
          data-vv-validate-on="blur"
          outline
          type="text"
          @blur="checkInvitationCodeField"
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
          id="password"
          v-model="password"
          v-validate="prop.rules"
          :append-icon="usePasswordField_appendIcon"
          :data-vv-as="prop.label"
          :data-vv-name="prop.validationKey"
          :error-messages="prop.firstErrorMessage"
          :label="prop.label"
          :success="usePasswordField_passwordSuccessState"
          :type="usePasswordField_passwordFieldType"
          color="grey darken-3"
          data-vv-validate-on="blur"
          name="password"
          outline
          @blur="usePasswordField_onPasswordEnter"
          @click:append="usePasswordField_togglePasswordFieldType"
        />
      </template>
    </VeeFormGroup>

    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.selectBestFit') | capitalize"
      :rules="validationRules.partner"
      validation-key="partner"
    >
      <template #default="prop">
        <v-select
          v-model="partner"
          v-validate="prop.rules"
          :data-vv-as="`'${prop.label}'`"
          :data-vv-name="prop.validationKey"
          :error-messages="prop.firstErrorMessage"
          :items="partnerOptions"
          :label="prop.label"
          color="grey darken-3"
          item-text="text"
          item-value="value"
          outline
        >
          <template #selection="{ item }">
            <div
              class="v-select__selection v-select__selection--comma caption font-weight-bold"
            >
              {{ item.text }}
            </div>
          </template>
        </v-select>
      </template>
    </VeeFormGroup>

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
          />
        </div>
      </template>
    </v-checkbox>

    <v-btn
      :disabled="$wait.is($WAIT_FOR.AUTH.ALL)"
      :loading="$wait.is($WAIT_FOR.AUTH.ALL)"
      class="ml-0 tertiary font-weight-bold"
      large
      type="submit"
    >
      <slot/>
    </v-btn>

    <AppWait
      :hide-message="true"
      :wait="$wait.is($WAIT_FOR.AUTH.ALL)"
      height="100%"
    />
  </form>
</template>

<script>
  import Cookie from 'js-cookie';
  import { mapActions } from 'vuex';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import usePasswordField from '@/mixins/usePasswordField';
  import registerMixins from '@/mixins/register';
  import useAuth from '@/mixins/useAuth';
  import AppWait from '@/components/App/AppWait';

  export default {
    components: { AppWait },
    mixins: [registerMixins, useBackendValidation, usePasswordField, useAuth],
    props: {
      legalLinks: {
        type: Object,
        required: true,
      },
      prefillEmail: {
        type: String,
        required: false,
      },
      invitationCode: {
        type: String,
        required: false,
      },
      showInvitationField: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data() {
      return {
        email: this.$route.query.email || '',
        emailNotUsed: null,
        password: '',
        internalInvitationCode: '',
        partner: null,
        partnerOptions: [
          {
            text: this.$t('register.form.partner.option1'),
            value: 'PersonalRegistration',
          },
          {
            text: this.$t('register.form.partner.option2'),
            value: 'MSPRegistration',
          },
        ],
        partnerSelected: false,
        termsAccepted: false,
        privacyAccepted: false,
        invitationCodeSuccessState: null,
      };
    },
    computed: {
      validationRules() {
        const rules = {
          email: 'required|email',
          password: 'required|min:7',
          partner: 'required',
        };

        if (this.showInvitationField) {
          rules.invitationCode = 'invitationCode|required';
        }

        return rules;
      },
    },
    watch: {
      termsAccepted(value) {
        this.privacyAccepted = value;
      },
    },
    created() {
      this.$validator.extend('invitationCode', {
        validate: value => ! value
                           || (!! this.codeExp.test(value) && !! this.getTrialPeriodFromCode(value)),
      });
    },
    beforeMount() {
      if (this.$auth.loggedIn) {
        this.$router.push('/');
      }
    },
    mounted() {
      if (this.invitationCode) {
        this.internalInvitationCode = this.invitationCode;
        this.$validator.validate('invitationCode', this.internalInvitationCode);
        this.checkInvitationCodeField();
      }

      if (this.prefillEmail) {
        this.email = this.prefillEmail;
      }
    },
    methods: {
      ...mapActions('user', ['registerUserAction']),
      checkInvitationCodeField() {
        setTimeout(() => {
          if (
            ! this.validationErrors.first('invitationCode')
            || ! this.validationErrors.first('invitationCode').length
          ) {
            this.invitationCodeSuccessState = true;
            this.$emit('on-input-invite-code', this.internalInvitationCode);
          } else if (this.internalInvitationCode.length > 0) {
            this.invitationCodeSuccessState = false;
          }
        }, 100);
      },
      async onSubmit() {
        this.useBackendValidation_reset();

        const result = await this.$validator.validateAll();
        if (! result) return;

        const lang = this.$i18n.locale;
        const partner = this.partner === this.partnerOptions[0].value ? null : this.partner;

        const payload = {
          email: this.email,
          password: this.password,
          termsAccepted: this.termsAccepted,
          privacyAccepted: this.privacyAccepted,
          lang,
          partner,
          registrationTrack: JSON.stringify({
            ctrack: Cookie.get('ctrack') ?? null,
            ga: Cookie.get('_ga') ?? null,
          }),
        };

        if (!! this.internalInvitationCode && this.internalInvitationCode.length > 0) {
          payload.invitationCode = this.internalInvitationCode;
        }

        this.registerUserAction(payload)
            .then(async () => {
              await this.useAuth_login({
                email: this.email,
                password: this.password,
              }, '/onboard/step1');
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response, {
                403: this.$t('auth.wrongCredentials'),
              }, this.$t('auth.aTemporaryErrorHasHappened'));
            });
      },
      emailFieldErrorMessage(validationErrorMessage) {
        if (validationErrorMessage && validationErrorMessage.length) {
          return validationErrorMessage;
        }

        if (this.emailNotUsed === false) {
          return this.$t('validation.emailInUse');
        }

        return null;
      },
    },
  };
</script>
