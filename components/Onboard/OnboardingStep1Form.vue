<template>
  <form @submit.prevent.stop="onSubmit">
    <BackendValidationAlert/>
    <div v-if="timezones.length > 0">
      <VeeFormGroup
        :error-bag="validationErrors"
        :label="$t('form.field.timezone') | capitalize"
        :rules="validationRules.timezone"
        validation-key="timezone"
      >
        <template #default="prop">
          <v-autocomplete
            v-model="userSettings.mainTimezone"
            v-validate="prop.rules"
            :data-vv-name="prop.validationKey"
            :error-messages="prop.firstErrorMessage"
            :items="timezones"
            :label="prop.label"
            data-vv-validate-on="blur"
            item-text="text"
            item-value="value"
            @input="onTimeZoneSelect"
          />
        </template>
      </VeeFormGroup>
      <VeeFormGroup
        :error-bag="validationErrors"
        :label="$t('form.field.region') | capitalize"
        :rules="validationRules.region"
        validation-key="region"
      >
        <template #default="prop">
          <v-autocomplete
            v-if="showRegionsSelect"
            v-model="userSettings.timezone"
            v-validate="prop.rules"
            :data-vv-name="prop.validationKey"
            :error-messages="prop.firstErrorMessage"
            :items="regionsOptions"
            :label="prop.label"
            data-vv-validate-on="blur"
            @input="onRegionSelect"
          >
            <template #selection="item">
              {{ formatRegion(item.item) }}
            </template>
            <template #item="item">
              {{ formatRegion(item.item) }}
            </template>
          </v-autocomplete>
        </template>
      </VeeFormGroup>
      <VeeFormGroup
        v-if="showDateFormat"
        :error-bag="validationErrors"
        :label="$t('form.field.dateFormat') | capitalize"
        :rules="validationRules.dateFormat"
        validation-key="dateFormat"
      >
        <template #default="prop">
          <v-select
            v-model="userSettings.dateFormat"
            v-validate="prop.rules"
            :data-vv-name="prop.validationKey"
            :error-messages="prop.firstErrorMessage"
            :items="dateFormatOptions"
            :label="prop.label"
            data-vv-validate-on="blur"
          />
        </template>
      </VeeFormGroup>
    </div>
    <div v-if="frontmen.length > 0">
      <VeeFormGroup
        :error-bag="validationErrors"
        :label="$t('form.field.dataCenter') | capitalize"
        :rules="validationRules.defaultFrontman"
        validation-key="defaultFrontman"
      >
        <template #default="prop">
          <v-select
            v-model="userSettings.defaultFrontman"
            v-validate="prop.rules"
            :data-vv-name="prop.validationKey"
            :error-messages="prop.firstErrorMessage"
            :items="frontmen"
            :label="prop.label"
            data-vv-validate-on="blur"
            item-text="location"
            item-value="id"
          >
            <template #append>
              <HelpTooltip
                :tooltip="$tooltip('USER_SETTINGS_DATA_CENTER')"
                orientation="bottom"
              />
            </template>
          </v-select>
        </template>
      </VeeFormGroup>
    </div>
    <v-btn
      :loading="$wait.is($WAIT_FOR.ONBOARD.SAVE)"
      class="ml-0"
      color="tertiary"
      type="submit"
    >
      {{ $t('button.save') }}
    </v-btn>
  </form>
</template>

<script>
  import 'moment-timezone';
  import moment from 'moment';
  import { mapActions } from 'vuex';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import HelpTooltip from '@/components/App/HelpTooltip';
  import datetimeMixin from '@/mixins/useDateTime';

  export default {
    components: {
      HelpTooltip,
    },
    mixins: [datetimeMixin, useBackendValidation],
    props: {
      settings: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      timezones: {
        type: Array,
        required: true,
      },
      regions: {
        type: Array,
        required: true,
      },
      frontmen: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        validationRules: {
          mainTimezone: 'required',
          timezone: 'required',
          region: 'required',
          dateFormat: 'required',
          defaultFrontman: 'required',
        },
        regionsOptions: this.regions,
        userSettings: this.settings ? {
          mainTimezone: this.settings.mainTimezone,
          timezone: this.settings.timezone,
          dateFormat: this.settings.dateFormat,
          defaultFrontman: this.settings.defaultFrontman,
        } : {
          mainTimezone: '',
          timezone: '',
          dateFormat: '',
          defaultFrontman: '',
        },
      };
    },
    computed: {
      showRegionsSelect() {
        return this.userSettings.mainTimezone !== '';
      },
      showDateFormat() {
        return !! this.userSettings.timezone;
      },
      dateFormatOptions() {
        const now = moment().utc().tz(this.userSettings.timezone);
        return this.endianFormatMap().map(({ endian }) => ({
          value: endian,
          text: this.parseEndianFormatFromMoment(now, endian),
        }));
      },
    },
    methods: {
      ...mapActions('onboarding', ['saveOnboardingPayload']),
      getMainTimezone(timezone) {
        return this.timezones.find(({ value }) => value === timezone);
      },
      onTimeZoneSelect() {
        const mainTimezone = this.getMainTimezone(this.userSettings.mainTimezone);
        if (!! mainTimezone && !! mainTimezone.utc) {
          this.regionsOptions = mainTimezone.utc;
          [this.userSettings.timezone] = this.regionsOptions;
          this.userSettings.dateFormat = mainTimezone.dateFormat?.[this.userSettings.timezone];
        }
      },
      onRegionSelect() {
        const mainTimezone = this.getMainTimezone(this.userSettings.mainTimezone);

        if (!! mainTimezone && !! mainTimezone.dateFormat) {
          this.userSettings.dateFormat = mainTimezone.dateFormat?.[this.userSettings.timezone];
        }
      },
      formatRegion(rawRegion) {
        if (! rawRegion) return '';

        return rawRegion.replace(/_/g, ' ');
      },
      async onSubmit() {
        if (! this.$auth.user.isAdmin()) return;

        this.useBackendValidation_reset();
        const result = await this.$validator.validateAll();
        if (! result) return;

        try {
          await this.saveOnboardingPayload({
            step: 1,
            payload: {
              timezone: this.userSettings.timezone,
              dateFormat: this.userSettings.dateFormat,
              defaultFrontman: this.userSettings.defaultFrontman,
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
