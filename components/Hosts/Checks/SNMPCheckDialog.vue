<template>
  <v-dialog
    :value="dialog"
    max-width="500px"
    persistent
  >
    <v-card>
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{
            (selectedSnmpCheck.hasId()
             ? $t('checks.updateSNMPCheck')
             : $t('checks.addSNMPCheck'))
              | capitalize
          }}
        </span>

        <HelpTooltip
          v-if="tooltipKey"
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

      <form @submit.prevent="onSubmit">
        <v-card-text>
          <VeeFormGroup
            v-if="selectedSnmpCheck.hasId()"
            :label="$t('form.field.preset') | capitalize"
          >
            <template #default="prop">
              <v-text-field
                :label="prop.label"
                :value="selectedSnmpCheck.preset"
                disabled
                single-line
              />
            </template>
          </VeeFormGroup>
          <VeeFormGroup
            v-else
            :error-bag="validationErrors"
            :label="$t('form.field.preset') | capitalize"
            validation-key="preset"
          >
            <template #default="prop">
              <v-select
                v-model="selectedSnmpCheck.preset"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
                :items="filteredPresetItems"
                :label="prop.label"
                data-vv-validate-on="blur"
              />
            </template>
          </VeeFormGroup>

          <VeeFormGroup
            :error-bag="validationErrors"
            :label="$t('form.field.checkInterval') | capitalize"
            validation-key="checkInterval"
          >
            <template #default="prop">
              <v-select
                v-model="selectedSnmpCheck.checkInterval"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
                :items="useCheckIntervals_checkIntervals"
                :label="prop.label"
                data-vv-validate-on="blur"
                item-disabled="disabled"
                item-value="value"
              >
                <template #selection="data">
                  {{ readableTime(data.item.value) }}
                </template>

                <template #item="data">
                  {{ readableTime(data.item.value) }}

                  <v-chip
                    v-if="data.item.disabled"
                    class="pull-right"
                    color="orange"
                    small
                    text-color="white"
                  >
                    {{ $t('phrase.premium') }}
                  </v-chip>
                </template>
              </v-select>
            </template>
          </VeeFormGroup>
          <BackendValidationAlert/>
        </v-card-text>
        <v-divider/>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            flat
            @click="onCancel"
          >
            {{ $t('button.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            flat
            type="submit"
          >
            <template v-if="selectedSnmpCheck.hasId()">
              {{ $t('checks.buttonUpdateCheck') }}
            </template>

            <template v-else>
              {{ $t('checks.buttonAddCheck') }}
            </template>
          </v-btn>
        </v-card-actions>
      </form>
    </v-card>

    <AppWait
      :wait="$wait.is([
        $WAIT_FOR.SNMP_CHECK.CREATE,
        $WAIT_FOR.SNMP_CHECK.UPDATE
      ])"
    >
      <template v-if="$wait.is($WAIT_FOR.SNMP_CHECK.CREATE)">
        {{ $t('message.wait.checkAdd') | capitalize }}
      </template>
      <template v-if="$wait.is($WAIT_FOR.SNMP_CHECK.UPDATE)">
        {{ $t('message.wait.checkUpdate') | capitalize }}
      </template>
    </AppWait>
  </v-dialog>
</template>

<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
  import HelpTooltip from '@/components/App/HelpTooltip';
  import AppWait from '@/components/App/AppWait';

  import useBackendValidation from '@/mixins/useBackendValidation';
  import useDateTime from '@/mixins/useDateTime';
  import useCheckIntervals from '@/mixins/useCheckIntervals';

  export default {
    components: {
      AppWait,
      HelpTooltip,
    },
    mixins: [
      useBackendValidation,
      useDateTime,
      useCheckIntervals,
    ],
    props: {
      tooltipKey: null,
    },
    data() {
      return {
        validationRules: {
          preset: 'required|string',
          checkInterval: 'required|integer',
        },
      };
    },
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('SNMPChecks', {
        dialog: 'snmpCheckDialog',
      }),
      ...mapState('SNMPChecks', ['selectedSnmpCheck', 'presets']),
      ...mapGetters('SNMPChecks', ['getSnmpChecksByHost']),
      snmpChecks() {
        return this.getSnmpChecksByHost(this.Host);
      },
      filteredPresetItems() {
        return this.presets.filter(
          presetItem => this.snmpChecks.every(
            ({ preset: existingPreset }) => presetItem !== existingPreset,
          ),
        );
      },
    },
    watch: {
      dialog(value) {
        if (value) {
          [this.selectedSnmpCheck.preset] = this.filteredPresetItems;
        }
      },
    },
    beforeDestroy() {
      this.reset();
    },
    methods: {
      ...mapMutations('SNMPChecks', [
        'resetSelectedSnmpCheck',
        'toggleSnmpCheckDialog',
      ]),
      ...mapActions('SNMPChecks', {
        updateSnmpCheckAction: 'updateSnmpCheck',
        createSnmpCheckAction: 'createSnmpCheck',
      }),
      async onSubmit() {
        this.useBackendValidation_reset();

        const result = await this.$validator.validateAll();
        if (! result) return;

        if (this.selectedSnmpCheck.hasId()) {
          this.updateSnmpCheck(this.selectedSnmpCheck);
        } else {
          this.createSnmpCheck(this.selectedSnmpCheck);
        }
      },
      createSnmpCheck(SnmpCheck) {
        this.createSnmpCheckAction({ SnmpCheck, Host: this.Host })
            .then(() => {
              this.$emit('on-create', { success: true, SnmpCheck });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-create', { success: false, SnmpCheck });
            });
      },
      updateSnmpCheck(SnmpCheck) {
        this.updateSnmpCheckAction({ SnmpCheck, Host: this.Host })
            .then(() => {
              this.$emit('on-update', { success: true, SnmpCheck });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-update', { success: false, SnmpCheck });
            });
      },
      onCancel() {
        this.toggleSnmpCheckDialog(false);
      },
      reset() {
        this.resetSelectedSnmpCheck(this.Host);
      },
    },
  };
</script>
