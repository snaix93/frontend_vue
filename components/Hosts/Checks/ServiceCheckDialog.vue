<template>
  <v-dialog
    :max-width="usePreflight_hasError ? '900px' : '600px'"
    :value="dialog"
    persistent
    scrollable
  >
    <form
      class="v-card white"
      @submit.prevent="onSubmit"
    >
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          <template v-if="isSSLCertificateCheck">
            {{ $t('checks.addSSLCertificateCheck') | capitalize }}
          </template>
          <template v-else>
            {{
              isUpdatingCheck(selectedServiceCheck)
              ? $t('checks.updateServiceCheck')
              : $t('checks.addServiceCheck') | capitalize
            }}
          </template>
        </span>

        <HelpTooltip
          v-if="tooltipKey && !isSSLCertificateCheck"
          :tooltip="$tooltip(tooltipKey)"
        />

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

      <v-card-text style="max-height: 70vh;">
        <PreflightErrorMessage
          v-if="usePreflight_hasError"
          :preflight-result="usePreflight_preflightResult"
        />

        <template v-else>
          <v-alert
            :value="isSSLCertificateCheck && Host.connectIsIP()"
            type="warning"
            class="mb-4"
          >
            {{ $t('checks.SSLIPWarning') }}
          </v-alert>
          <template v-if="isCreatingCheck(selectedServiceCheck)">
            <VeeFormGroup :label="$t('form.field.service') | capitalize">
              <template #default="prop">
                <v-select
                  v-model="service"
                  :items="serviceList"
                  :label="prop.label"
                  :menu-props="{ maxHeight: 'auto' }"
                  item-disabled="disabled"
                  @change="onServiceSelect"
                >
                  <template #selection="{ item }">
                    {{ $t('checks.' + item.key) }}
                  </template>
                  <template #item="{ item }">
                    <div
                      :class="item.key === service.key ? 'selected' : ''"
                    >
                      {{ $tc('checks.' + item.key) }}
                      <v-chip
                        v-if="item.protocol"
                        :color="item.key === service.key ? 'primary' : 'grey'"
                        :outline="item.key !== service.key"
                        :text-color="item.key === service.key ? 'white' : 'grey'"
                        class="ml-1"
                        disabled
                        small
                      >
                        {{ item.protocol }}
                      </v-chip>
                      <v-chip
                        :color="item.key === service.key ? 'primary' : 'grey'"
                        :outline="item.key !== service.key"
                        :text-color="item.key === service.key ? 'white' : 'grey'"
                        class="ml-1"
                        disabled
                        small
                      >
                        <span v-if="item.port !== 'custom'">
                          {{ $t('checks.port') | capitalize }}
                          {{ item.port }}
                        </span>
                        <span v-else>
                          {{ item.port | capitalize }}
                          {{ $t('checks.port') | capitalize }}
                        </span>
                      </v-chip>
                    </div>
                  </template>
                </v-select>
              </template>
            </VeeFormGroup>

            <VeeFormGroup
              :error-bag="validationErrors"
              :label="$t('form.field.port') | capitalize"
              validation-key="port"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedServiceCheck.port"
                  :data-vv-name="prop.validationKey"
                  :error-messages="prop.firstErrorMessage"
                  :label="prop.label"
                  data-vv-validate-on="blur"
                />
              </template>
            </VeeFormGroup>
          </template>
          <template v-if="isUpdatingCheck(selectedServiceCheck)">
            <VeeFormGroup :label="$t('form.field.service') | capitalize">
              <template #default="prop">
                <v-text-field
                  :label="prop.label"
                  :value="$tc('checks.' + selectedServiceCheck.service.toLowerCase())"
                  disabled
                  single-line
                />
              </template>
            </VeeFormGroup>

            <VeeFormGroup
              :error-bag="validationErrors"
              :label="$t('form.field.port') | capitalize"
              validation-key="port"
            >
              <template #default="prop">
                <v-text-field
                  v-model="selectedServiceCheck.port"
                  :data-vv-name="prop.validationKey"
                  :error-messages="prop.firstErrorMessage"
                  :label="prop.label"
                  data-vv-validate-on="blur"
                  disabled
                  single-line
                />
              </template>
            </VeeFormGroup>
          </template>

          <VeeFormGroup
            :error-bag="validationErrors"
            :label="$t('form.field.checkInterval') | capitalize"
            validation-key="checkInterval"
          >
            {{ selectedServiceCheck.checkInterval }}
            <template #default="prop">
              <v-select
                v-if="!isSSLCertificateCheck"
                v-model="selectedServiceCheck.checkInterval"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
                :items="useCheckIntervals_checkIntervals"
                :label="prop.label"
                data-vv-validate-on="blur"
                item-disabled="disabled"
                item-value="value"
              >
                <template #selection="{ item }">
                  {{ readableTime(item.value) }}
                </template>
                <template #item="{ item }">
                  {{ readableTime(item.value) }}
                  <v-chip
                    v-if="item.disabled"
                    class="pull-right"
                    color="orange"
                    small
                    text-color="white"
                  >
                    {{ $t('phrase.premium') }}
                  </v-chip>
                </template>
              </v-select>

              <v-text-field
                v-if="isSSLCertificateCheck"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
                :label="prop.label"
                :value="readableTime(selectedServiceCheck.checkInterval)"
                data-vv-validate-on="blur"
                disabled
              />
            </template>
          </VeeFormGroup>
        </template>

        <BackendValidationAlert/>
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <template v-if="!usePreflight_hasError">
          <v-btn
            flat
            @click="onCancel"
          >
            {{ $t('button.cancel') }}
          </v-btn>
          <v-spacer/>
          <v-btn
            v-if="isUpdatingCheck(selectedServiceCheck)"
            color="primary"
            flat
            type="submit"
          >
            {{ $t('checks.buttonUpdateCheck') }}
          </v-btn>
          <v-btn
            v-else
            color="primary"
            flat
            type="submit"
            @click="usePreflight_togglePreflightOn(Host, 'serviceCheck', selectedServiceCheck)"
          >
            {{ $t('checks.buttonAddCheck') }}
          </v-btn>
        </template>
        <template v-else>
          <v-btn
            flat
            type="submit"
            @click="usePreflight_togglePreflightOff(Host, 'serviceCheck', selectedServiceCheck)"
          >
            {{ $t('checks.buttonAddCheckAnyways') }}
          </v-btn>
          <v-spacer/>
          <v-btn
            color="primary"
            flat
            type="submit"
            @click="usePreflight_togglePreflightOn(Host, 'serviceCheck', selectedServiceCheck)"
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
        </template>
      </v-card-actions>
    </form>

    <AppWait
      :wait="$wait.is([
        $WAIT_FOR.SERVICE_CHECK.PREFLIGHT,
        $WAIT_FOR.SERVICE_CHECK.CREATE,
        $WAIT_FOR.SERVICE_CHECK.UPDATE,
      ])"
    >
      <template v-if="$wait.is($WAIT_FOR.SERVICE_CHECK.PREFLIGHT)">
        {{ $t('message.wait.checkPreflight') | capitalize }}
      </template>
      <template v-if="$wait.is($WAIT_FOR.SERVICE_CHECK.CREATE)">
        {{ $t('message.wait.checkAdd') | capitalize }}
      </template>
      <template v-if="$wait.is($WAIT_FOR.SERVICE_CHECK.UPDATE)">
        {{ $t('message.wait.checkUpdate') | capitalize }}
      </template>
    </AppWait>
  </v-dialog>
</template>

<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
  import PreflightErrorMessage from '@/components/Hosts/Checks/PreflightErrorMessage';
  import HelpTooltip from '@/components/App/HelpTooltip';
  import AppWait from '@/components/App/AppWait';

  import useBackendValidation from '@/mixins/useBackendValidation';
  import useDateTime from '@/mixins/useDateTime';
  import usePreflight from '@/mixins/usePreflight';
  import useCheckIntervals from '@/mixins/useCheckIntervals';
  import serviceCheckMixin from '@/mixins/serviceCheckMixin';

  export default {
    components: {
      PreflightErrorMessage,
      HelpTooltip,
      AppWait,
    },
    mixins: [
      useBackendValidation,
      useDateTime,
      usePreflight,
      useCheckIntervals,
      serviceCheckMixin,
    ],
    props: {
      tooltipKey: null,
    },
    data() {
      return {
        validationRules: {
          service: 'required|max:100',
          port: 'required|integer|port',
          checkInterval: 'required|integer',
        },
        service: {},
      };
    },
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('serviceChecks', {
        dialog: 'serviceCheckDialog',
      }),
      ...mapState('serviceChecks', ['selectedServiceCheck']),
      ...mapGetters('hosts', ['availableServiceChecks']),
      isSSLCertificateCheck() {
        return this.selectedServiceCheck.isSslCheck;
      },
      serviceList() {
        let result = JSON.parse(JSON.stringify(this.availableServiceChecks));
        if (! this.isSSLCertificateCheck) return result;
        return result
          .filter(({ key }) => ['https', 'imaps', 'pop3s', 'smtps'].includes(key))
          .map((service) => {
            service.protocol = 'ssl';
            return service;
          });
      },
    },
    created() {
      [this.service] = this.serviceList;
      this.setupValidation();
    },
    beforeDestroy() {
      this.reset();
    },
    methods: {
      ...mapMutations('serviceChecks', [
        'resetSelectedServiceCheckToSSLCertificateCheck',
        'resetSelectedServiceCheckToCustomPort',
        'resetSelectedServiceCheck',
        'toggleServiceCheckDialog',
      ]),
      ...mapActions('serviceChecks', {
        updateServiceCheckAction: 'updateServiceCheck',
        createServiceCheckAction: 'createServiceCheck',
      }),
      onServiceSelect(selection) {
        if (selection.key === 'custom') {
          this.resetSelectedServiceCheckToCustomPort(this.Host);
        } else {
          this.reset();
          this.selectedServiceCheck.service = selection.key;
          this.selectedServiceCheck.port = selection.port;
          this.selectedServiceCheck.protocol = selection.protocol;
        }
      },
      async onSubmit() {
        this.useBackendValidation_reset();

        const result = await this.$validator.validateAll();
        if (! result) return;

        if (this.selectedServiceCheck.hasId()) {
          this.updateServiceCheck(this.selectedServiceCheck);
        } else {
          this.createServiceCheck(this.selectedServiceCheck);
        }
      },
      createServiceCheck(ServiceCheck) {
        this.createServiceCheckAction({ ServiceCheck, Host: this.Host })
            .then(() => {
              this.$emit('on-create', { success: true, ServiceCheck });
            })
            .catch(({ response }) => {
              if (! this.useBackendValidation_renderAnyErrors(response) && response?.status === 412) {
                this.usePreflight_renderResponseError(response.data.data);
              }
              this.$emit('on-create', { success: false, ServiceCheck });
            });
      },
      updateServiceCheck(ServiceCheck) {
        this.updateServiceCheckAction({ ServiceCheck, Host: this.Host })
            .then(() => {
              this.$emit('on-update', { success: true, ServiceCheck });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-update', { success: false, ServiceCheck });
            });
      },
      onCancel() {
        this.toggleServiceCheckDialog(false);
      },
      reset() {
        if (this.isSSLCertificateCheck) {
          this.resetSelectedServiceCheckToSSLCertificateCheck(this.Host);
        } else {
          this.resetSelectedServiceCheck(this.Host);
        }
      },
      setupValidation() {
        this.$validator.extend('port', {
          validate: (value) => {
            const port = parseInt(value);
            return port && port > 0 && port < 65536;
          },
        });

        this.$validator.attach({
          alias: this.$t('form.field.service'),
          name: 'service',
          rules: this.validationRules.service,
          getter: () => this.selectedServiceCheck.service,
        });

        this.$validator.attach({
          alias: this.$t('form.field.port'),
          name: 'port',
          rules: this.validationRules.port,
          getter: () => this.selectedServiceCheck.port,
        });

        this.$validator.attach({
          alias: this.$t('form.field.checkInterval'),
          name: 'checkInterval',
          rules: this.validationRules.checkInterval,
          getter: () => this.selectedServiceCheck.checkInterval,
        });
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .pull-right
    margin-left: auto;

  .selected
    opacity: 0.6
</style>
