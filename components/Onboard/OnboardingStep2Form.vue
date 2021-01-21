<template>
  <form @submit.prevent.stop="onSubmit">
    <BackendValidationAlert/>
    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.yourName') | capitalize"
      :rules="validationRules.name"
      validation-key="name"
    >
      <template #default="prop">
        <v-text-field
          v-model="settings.name"
          v-validate="prop.rules"
          :error-messages="prop.firstErrorMessage"
          :label="prop.label"
          data-vv-validate-on="blur"
          name="name"
        />
      </template>
    </VeeFormGroup>
    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.companyName') | capitalize"
      :rules="validationRules.companyName"
      validation-key="companyName"
    >
      <template #default="prop">
        <v-text-field
          v-model="settings.companyName"
          v-validate="prop.rules"
          :error-messages="prop.firstErrorMessage"
          :label="prop.label"
          data-vv-validate-on="blur"
          name="companyName"
        />
      </template>
    </VeeFormGroup>
    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.phone') | capitalize"
      :rules="validationRules.phoneNumber"
      validation-key="phoneNumber"
    >
      <template #default="prop">
        <PhoneNumberField
          v-model="settings.phoneNumber"
          :placeholder="prop.label"
          class="v-input v-text-field v-input--has-state theme--light error--text"
        />
        <v-flex xs12>
          <v-alert
            :outline="true"
            :value="prop.firstErrorMessage"
            type="error"
          >
            {{ prop.firstErrorMessage }}
          </v-alert>
        </v-flex>
      </template>
    </VeeFormGroup>

    <v-item-group>
      <v-container fluid mx-0 px-0>
        <v-layout wrap>
          <v-flex mb-2 mx-0 px-0 xs12>
            <v-label class="theme--light">
              {{ $t('onboarding.step2.howManyHostsToMonitor') }}
            </v-label>
          </v-flex>
          <v-flex
            v-for="item in expectedHostRequirementsOptions"
            :key="item"
          >
            <v-item>
              <v-card
                slot-scope="{ active, toggle }"
                :color="active ? 'primary' : ''"
                class="d-flex align-center"
                height="35"
                @click="selectExpectedHostRequirements(toggle, item)"
              >
                <v-card-text
                  :class="{ 'white--text': active }"
                  class="subheading text-xs-center"
                >
                  {{ item }}
                </v-card-text>
              </v-card>
            </v-item>
          </v-flex>
        </v-layout>
      </v-container>
    </v-item-group>

    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.whatDoYouWantToAchieve') | capitalize"
      :rules="validationRules.reasonForSignup"
      validation-key="reasonForSignup"
    >
      <template #default="prop">
        <v-select
          v-model="settings.reasonForSignup"
          v-validate="prop.rules"
          :data-vv-name="prop.validationKey"
          :error-messages="prop.firstErrorMessage"
          :items="reasonForSignupOptions"
          :label="prop.label"
          data-vv-validate-on="blur"
        />
      </template>
    </VeeFormGroup>

    <v-btn
      :loading="$wait.is($WAIT_FOR.ONBOARD.SAVE)"
      class="ml-0 mt-5"
      color="tertiary"
      type="submit"
    >
      {{ $t('button.getStarted') | capitalize }}
    </v-btn>
  </form>
</template>

<script>
  import { mapActions } from 'vuex';
  import PhoneNumberField from '@/components/Recipients/PhoneNumberField';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import HelpTooltip from '@/components/App/HelpTooltip';

  export default {
    components: {
      PhoneNumberField,
      HelpTooltip,
    },
    mixins: [useBackendValidation],
    data() {
      return {
        settings: {
          name: '',
          companyName: '',
          phoneNumber: '',
          expectedHostRequirements: '',
          reasonForSignup: '',
        },
        reasonForSignupOptions: [
          {
            text: this.$t('onboarding.step2.reasonForSignupOptions.replace'),
            value: 'replace current monitoring'
          },
          {
            text: this.$t('onboarding.step2.reasonForSignupOptions.new'),
            value: 'set up first monitoring'
          },
          {
            text: this.$t('onboarding.step2.reasonForSignupOptions.other'),
            value: 'other'
          },
        ],
        expectedHostRequirementsOptions: [
          '1-10', '11-50', '51-100', '101-250', '250+'
        ],
        validationRules: {
          name: 'min:3|max:100',
          companyName: 'min:3|max:100',
          phoneNumber: 'min:6|max:100|phoneNumber',
          expectedHostRequirements: '',
          reasonForSignup: '',
        },
      };
    },
    created() {
      this.$validator.extend('phoneNumber', {
        validate(value) {
          if (! value) return false;

          return /^\+[0-9]+$/.test(value);
        },
      });
      this.$validator.attach({
        name: 'phoneNumber',
        rules: this.validationRules.phoneNumber,
        getter: () => {
          return this.settings.phoneNumber;
        },
      });
    },
    methods: {
      ...mapActions('onboarding', ['saveOnboardingPayload']),
      selectExpectedHostRequirements(toggle, item) {
        toggle();
        this.settings.expectedHostRequirements = item;
      },
      async onSubmit() {
        if (! this.$auth.user.isAdmin()) return;

        this.useBackendValidation_reset();
        const result = await this.$validator.validateAll();
        if (! result) return;

        try {
          await this.saveOnboardingPayload({
            step: 2,
            payload: {
              name: this.settings.name,
              companyName: this.settings.companyName,
              phoneNumber: this.settings.phoneNumber,
              expectedHostRequirements: this.settings.expectedHostRequirements,
              reasonForSignup: this.settings.reasonForSignup,
            },
          });

        } catch ({ response }) {
          this.useBackendValidation_renderAnyErrors(response);
          this.$flash.error(this.$t('message.error.userSettingsSaved'));
        }
      },
    },
  };
</script>
