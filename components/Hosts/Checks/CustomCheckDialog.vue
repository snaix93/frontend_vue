<template>
  <v-dialog
    :value="dialog"
    max-width="800px"
    persistent
  >
    <v-card>
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          <template v-if="!!createSuccess">
            {{ $tc('checks.customCheckAdded') | capitalize }}

          </template>
          <template v-else>
            {{
              (selectedCustomCheck.hasId()
               ? $tc('checks.updateCustomCheck')
               : $tc('checks.addCustomCheck')) | capitalize
            }}
          </template>
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
        <v-card-text v-if="createSuccess">
          <CustomCheckInstallation
            :check="selectedCustomCheck"
          />
        </v-card-text>
        <v-card-text v-else>
          <VeeFormGroup
            :error-bag="validationErrors"
            :label="$t('phrase.checkName') | capitalize"
            :rules="validationRules.name"
            validation-key="name"
          >
            <template #default="prop">
              <v-text-field
                v-model="selectedCustomCheck.name"
                v-validate="prop.rules"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
                :hint="$t('form.hint.checkName')"
                :label="prop.label"
                data-vv-validate-on="blur"
                persistent-hint
              />
            </template>
          </VeeFormGroup>

          <v-layout
            align-items-center
            justify-space-between
            mt-4
          >
            <v-flex>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.expectedUpdateInterval') | capitalize"
                :rules="validationRules.updateIntervalMinutes"
                validation-key="updateIntervalMinutes"
              >
                <template #default="prop">
                  <v-text-field
                    v-model="updateInterval.minutes"
                    v-validate.disable="prop.rules"
                    :data-vv-name="prop.validationKey"
                    :error-messages="prop.firstErrorMessage"
                    :hint="`5-59 ${$t('phrase.minutes')}`"
                    :label="prop.label"
                    persistent-hint
                  >
                    <template #append>
                      {{ $t('phrase.minutes') }}
                    </template>
                  </v-text-field>
                </template>
              </VeeFormGroup>
            </v-flex>
            <v-flex
              class="font-weight-bold"
              mt-3
              mx-4
            >
              :
            </v-flex>
            <v-flex>
              <VeeFormGroup
                :error-bag="validationErrors"
                :label="$t('form.field.expectedUpdateInterval') | capitalize"
                :rules="validationRules.updateIntervalHours"
                validation-key="updateIntervalHours"
              >
                <template #default="prop">
                  <v-text-field
                    v-model="updateInterval.hours"
                    v-validate.disable="prop.rules"
                    :data-vv-name="prop.validationKey"
                    :error-messages="prop.firstErrorMessage"
                    :hint="`0-200 ${$t('phrase.hours')}`"
                    :label="prop.label"
                    persistent-hint
                  >
                    <template #append>
                      {{ $t('phrase.hours') }}
                    </template>
                  </v-text-field>
                </template>
              </VeeFormGroup>
            </v-flex>
          </v-layout>

          <CustomCheckInstallation
            v-if="selectedCustomCheck.hasId()"
            :check="selectedCustomCheck"
          />

          <BackendValidationAlert/>
        </v-card-text>
        <v-divider/>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            flat
            @click="onCancel"
          >
            {{ createSuccess ? $t('button.close') : $t('button.cancel') }}
          </v-btn>
          <v-btn
            v-if="!createSuccess"
            color="primary"
            flat
            type="submit"
          >
            <template v-if="selectedCustomCheck.hasId()">
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
        $WAIT_FOR.CUSTOM_CHECK.CREATE,
        $WAIT_FOR.CUSTOM_CHECK.UPDATE,
      ])"
    >
      <template v-if="$wait.is($WAIT_FOR.CUSTOM_CHECK.CREATE)">
        {{ $t('message.wait.checkAdd') | capitalize }}
      </template>
      <template v-if="$wait.is($WAIT_FOR.CUSTOM_CHECK.UPDATE)">
        {{ $t('message.wait.checkUpdate') | capitalize }}
      </template>
    </AppWait>
  </v-dialog>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import AppWait from '@/components/App/AppWait';
  import CustomCheckInstallation from '@/components/Hosts/Checks/CustomCheckInstallation';
  import HelpTooltip from '@/components/App/HelpTooltip';

  import useBackendValidation from '@/mixins/useBackendValidation';

  export default {
    components: {
      AppWait,
      CustomCheckInstallation,
      HelpTooltip,
    },
    mixins: [
      useBackendValidation,
    ],
    props: {
      tooltipKey: null,
    },
    data() {
      return {
        updateInterval: {
          minutes: 5,
          hours: 0,
        },
        createSuccess: false,
      };
    },
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('customChecks', {
        dialog: 'customCheckDialog',
      }),
      ...mapState('customChecks', ['customChecks', 'selectedCustomCheck']),
      validationRules() {
        const rules = {
          name: {
            required: true,
            min: 3,
            max: 25,
            regex: '^[a-zA-Z0-9]+$',
          },
          updateIntervalMinutes: {
            required: true,
            integer: true,
            max_value: 59,
          },
          updateIntervalHours: {
            required: true,
            integer: true,
            min_value: 0,
            max_value: 200,
          },
        };

        if (+this.updateInterval.hours === 0) {
          rules.updateIntervalMinutes.min_value = 5;
        } else {
          rules.updateIntervalMinutes.min_value = 0;
        }

        Object.keys(rules).forEach((key) => {
          const config = Object.keys(rules[key]).map((configKey) => {
            if (rules[key][configKey] === true) {
              return configKey;
            }
            return `${configKey}:${rules[key][configKey]}`;
          });

          rules[key] = config.join('|');
        });

        return rules;
      },
    },
    created() {
      if (this.selectedCustomCheck.hasId()) {
        this.setupInterval();
      }
    },
    beforeDestroy() {
      this.reset();
    },
    methods: {
      ...mapMutations('customChecks', [
        'resetSelectedCustomCheck',
        'toggleCustomCheckDialog',
      ]),
      ...mapActions('customChecks', {
        updateCustomCheckAction: 'updateCustomCheck',
        createCustomCheckAction: 'createCustomCheck',
      }),
      async onSubmit() {
        this.useBackendValidation_reset();

        const result = await this.$validator.validateAll();
        if (! result) return;

        this.selectedCustomCheck.expectedUpdateInterval = parseInt(this.calculateUpdateInterval());

        if (this.selectedCustomCheck.hasId()) {
          this.updateCustomCheck(this.selectedCustomCheck);
        } else {
          this.createCustomCheck(this.selectedCustomCheck);
        }
      },
      createCustomCheck(CustomCheck) {
        this.createCustomCheckAction({ CustomCheck, Host: this.Host })
            .then(() => {
              this.createSuccess = true;
              this.$emit('on-create', { success: true, CustomCheck });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-create', { success: false, CustomCheck });
            });
      },
      updateCustomCheck(CustomCheck) {
        this.updateCustomCheckAction({ CustomCheck, Host: this.Host })
            .then(() => {
              this.$emit('on-update', { success: true, CustomCheck });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-update', { success: false, CustomCheck });
            });
      },
      setupInterval() {
        this.updateInterval.hours = parseInt(this.selectedCustomCheck.expectedUpdateInterval / 60 / 60);
        this.updateInterval.minutes = parseInt((this.selectedCustomCheck.expectedUpdateInterval % 3600) / 60);
      },
      calculateUpdateInterval() {
        return (this.updateInterval.minutes * 60) + (this.updateInterval.hours * 60 * 60);
      },
      onCancel() {
        this.toggleCustomCheckDialog(false);
      },
      reset() {
        this.resetSelectedCustomCheck(this.Host);
      },
    },
  };
</script>
