<template>
  <v-dialog
    :value="dialog"
    max-width="600px"
    persistent
  >
    <v-card>
      <form @submit.prevent="createWithPreflight">
        <v-card-title class="py-2 grey lighten-3">
          <span class="headline">
            {{ $tc('checks.createWebMonitoring') | capitalize }}
          </span>
          <v-spacer/>
          <v-btn
            class="mr-0"
            icon
            @click="onCancel"
          >
            <v-icon>clear</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider/>

        <v-card-text>
          <template v-if="usePreflight_preflightError">
            <PreflightErrorMessage :preflight-result="usePreflight_preflightResult"/>
          </template>

          <template v-else>
            <BackendValidationAlert/>
            <v-layout wrap>
              <v-flex md3 xs4>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.protocol') | capitalize"
                  :rules="validationRules.protocol"
                  validation-key="protocol"
                >
                  <template #default="prop">
                    <v-select
                      v-model="protocol"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :disabled="$wait.is($WAIT_FOR.DASHBOARD.WEB_CHECK_WIZARD.CREATE)"
                      :error-messages="prop.firstErrorMessage"
                      :items="protocols"
                      :label="prop.label"
                      append-outer-icon="://"
                      class="pr-2"
                      data-vv-validate-on="blur"
                      return-object
                      single-line
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>

              <v-flex md6 xs8>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.url') | capitalize"
                  :rules="validationRules.url"
                  validation-key="url"
                >
                  <template #default="prop">
                    <v-text-field
                      v-model="url"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :disabled="$wait.is($WAIT_FOR.DASHBOARD.WEB_CHECK_WIZARD.ALL)"
                      :error-messages="prop.firstErrorMessage"
                      :hint="$t('form.hint.url') | capitalize"
                      :label="prop.label"
                      data-vv-validate-on="blur"
                      persistent-hint
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>

              <v-flex md3 xs12>
                <v-btn
                  :disabled="$wait.is($WAIT_FOR.DASHBOARD.WEB_CHECK_WIZARD.ALL)"
                  block
                  color="primary"
                  type="submit"
                >
                  <v-progress-circular
                    v-if="$wait.is($WAIT_FOR.DASHBOARD.WEB_CHECK_WIZARD.ALL)"
                    :size="20"
                    :width="2"
                    color="secondary"
                    indeterminate
                  />
                  <template v-else>
                    {{ $t('checks.create') }}
                  </template>
                </v-btn>
              </v-flex>
            </v-layout>
          </template>
        </v-card-text>
        <v-card-actions v-if="usePreflight_preflightError">
          <v-btn
            flat
            @click="createWithoutPreflight"
          >
            {{ $t('checks.buttonAddCheckAnyways') }}
          </v-btn>
          <v-spacer/>
          <v-btn
            color="primary"
            flat
            @click="createWithPreflight"
          >
            <v-icon left>
              replay
            </v-icon>
            {{ $t('checks.reValidate') }}
          </v-btn>
          <v-btn
            color="primary"
            flat
            @click="onCancel"
          >
            {{ $t('button.cancel') }}
          </v-btn>
        </v-card-actions>
      </form>
    </v-card>
    <AppWait :wait="$wait.is($WAIT_FOR.DASHBOARD.WEB_CHECK_WIZARD.ALL)">
      {{ $t('message.wait.checkAdd') | capitalize }}
    </AppWait>
  </v-dialog>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import PreflightErrorMessage from '@/components/Hosts/Checks/PreflightErrorMessage';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import serviceCheckMixin from '@/mixins/serviceCheckMixin';
  import usePreflight from '@/mixins/usePreflight';
  import AppWait from '@/components/App/AppWait';
  import WebCheck from '@/models/WebCheck';

  export default {
    components: { AppWait, PreflightErrorMessage },
    mixins: [
      useBackendValidation,
      serviceCheckMixin,
      usePreflight
    ],
    data() {
      return {
        protocols: ['http', 'https'],
        protocol: null,
        url: null,
        validationRules: {
          protocol: 'required|included:http,https',
          url: 'required|url',
        },
      };
    },
    computed: {
      ...mapState('dashboard', {
        dialog: 'webCheckWizardDialog',
      }),
      completeUrl() {
        return `${this.protocol}://${this.url}`;
      },
    },
    watch: {
      url(value) {
        if (value.startsWith('http://')) {
          this.protocol = 'http';
        } else if (value.startsWith('https://')) {
          this.protocol = 'https';
        }

        this.url = value.replace(/^(?:https?:\/\/)?/i, '');
      },
    },
    methods: {
      ...mapMutations('dashboard', ['toggleWebCheckWizardDialog']),
      async createWebcheckByWizard(preflight = true) {
        this.useBackendValidation_reset();
        this.usePreflight_preflightReset();

        const result = await this.$validator.validateAll();
        if (! result) return;

        this.$wait.start(this.$WAIT_FOR.DASHBOARD.WEB_CHECK_WIZARD.CREATE);

        WebCheck
          .createFromWizard({ url: this.completeUrl, preflight })
          .then((WebCheck) => {
            this.$emit('on-create', { success: true, WebCheck });
          })
          .catch(({ response }) => {
            if (! this.useBackendValidation_renderAnyErrors(response) && response?.status === 412) {
              this.usePreflight_renderResponseError(response.data.data);
            }
          })
          .finally(() => {
            this.$wait.end(this.$WAIT_FOR.DASHBOARD.WEB_CHECK_WIZARD.CREATE);
          });
      },
      async createWithPreflight() {
        await this.createWebcheckByWizard(true);
      },
      async createWithoutPreflight() {
        await this.createWebcheckByWizard(false);
      },
      onCancel() {
        this.toggleWebCheckWizardDialog();
      },
    },
  };
</script>
