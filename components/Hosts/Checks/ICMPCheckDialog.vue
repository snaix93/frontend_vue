<template>
  <v-dialog
    persistent
    scrollable
    :value="dialog"
    :max-width="usePreflight_hasError ? '900px' : '500px'"
  >
    <form
      class="v-card white"
      data-cy="icmpForm"
      @submit.prevent="onSubmit"
    >
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{
            isUpdatingCheck(selectedServiceCheck)
              ? $t('checks.updateICMPCheck')
              : $t('checks.addICMPCheck') | capitalize
          }}
        </span>

        <HelpTooltip
          v-if="tooltipKey"
          :tooltip="$tooltip(tooltipKey)"
        />

        <v-spacer/>

        <v-btn
          icon
          class="mr-0"
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider/>

      <v-card-text>
        <PreflightErrorMessage
          v-if="usePreflight_hasError"
          :preflight-result="usePreflight_preflightResult"
        />

        <template v-else>
          <VeeFormGroup
            validation-key="checkInterval"
            :error-bag="validationErrors"
            :label="$t('form.field.checkInterval') | capitalize"
          >
            <template #default="prop">
              <v-select
                v-model="selectedServiceCheck.checkInterval"
                :items="useCheckIntervals_checkIntervals"
                :label="prop.label"
                data-vv-validate-on="blur"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
                item-value="value"
                item-disabled="disabled"
              >
                <template #selection="data">
                  {{ readableTime(data.item.value) }}
                </template>

                <template #item="data">
                  {{ readableTime(data.item.value) }}

                  <v-chip
                    v-if="data.item.disabled"
                    color="orange"
                    text-color="white"
                    small
                    class="pull-right"
                  >
                    {{ $t('phrase.premium') }}
                  </v-chip>
                </template>
              </v-select>
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
            flat
            color="primary"
            type="submit"
          >
            {{ $t('checks.buttonUpdateCheck') }}
          </v-btn>

          <v-btn
            v-else
            flat
            color="primary"
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
            flat
            color="primary"
            type="submit"
            @click="usePreflight_togglePreflightOn(Host, 'serviceCheck', selectedServiceCheck)"
          >
            <v-icon left>
              replay
            </v-icon>
            {{ $t('checks.reValidate') }}
          </v-btn>
          <v-btn
            flat
            color="primary"
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
  import {mapState, mapMutations, mapActions} from 'vuex';
  import AppWait from '@/components/App/AppWait';
  import HelpTooltip from '@/components/App/HelpTooltip';
  import PreflightErrorMessage from '@/components/Hosts/Checks/PreflightErrorMessage';

  import useBackendValidation from '@/mixins/useBackendValidation';
  import useDateTime from '@/mixins/useDateTime';
  import usePreflight from '@/mixins/usePreflight';
  import useCheckIntervals from "@/mixins/useCheckIntervals";
  import serviceCheckMixin from '@/mixins/serviceCheckMixin';

  export default {
    components: {
      AppWait,
      HelpTooltip,
      PreflightErrorMessage,
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
          checkInterval: 'required|integer',
        },
      };
    },
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('serviceChecks', {
        dialog: 'ICMPCheckDialog',
      }),
      ...mapState('serviceChecks', ['selectedServiceCheck']),
    },
    beforeDestroy() {
      this.reset();
    },
    created() {
      this.setupValidation();
    },
    methods: {
      ...mapMutations('serviceChecks', [
        'resetSelectedServiceCheckToICMP',
        'toggleICMPCheckDialog',
      ]),
      ...mapActions('serviceChecks', {
        updateServiceCheckAction: 'updateServiceCheck',
        createServiceCheckAction: 'createServiceCheck',
      }),
      async onSubmit() {
        this.useBackendValidation_reset();

        const result = await this.$validator.validateAll();
        if (!result) return;

        if (this.isUpdatingCheck(this.selectedServiceCheck)) {
          this.updateServiceCheck(this.selectedServiceCheck);
        } else {
          this.createServiceCheck(this.selectedServiceCheck);
        }
      },
      createServiceCheck(ServiceCheck) {
        this.createServiceCheckAction({ ServiceCheck, Host: this.Host })
            .then(() => {
              this.toggleICMPCheckDialog(false);
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
              this.toggleICMPCheckDialog(false);
              this.$emit('on-update', { success: true, ServiceCheck });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-update', { success: false, ServiceCheck });
            });
      },
      onCancel() {
        this.toggleICMPCheckDialog(false);
      },
      reset() {
        this.resetSelectedServiceCheckToICMP(this.Host);
      },
      setupValidation() {
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
