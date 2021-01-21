<template>
  <v-dialog
    v-model="dialog"
    lazy
    persistent
    max-width="950px"
  >
    <form
      class="v-card white"
      @submit.prevent="onSubmit()"
    >
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ $t('rule.wizards.snmpRule.headline', { checkKey: checkKeyLabel }) }}
        </span>

        <v-spacer/>

        <v-btn
          icon
          class="mr-0"
          @click="onCancel()"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text
        class="py-0"
        :class="{
          'px-3' : !!$vuetify.breakpoint.mdAndDown,
          'px-5' : !$vuetify.breakpoint.mdAndDown
        }"
      >
        <v-timeline dense>
          <v-timeline-item
            color="primary"
            fill-dot
            icon="edit"
            :hide-dot="!!$vuetify.breakpoint.xsOnly"
            :small="!!$vuetify.breakpoint.smAndDown"
          >
            <v-layout
              row
              wrap
              align-center
            >
              <v-flex
                sm12
                md4
                class="pr-3"
              >
                <div class="section-subheaders mb-2 grey lighten-2 pa-3">
                  <span class="font-weight-medium subheading">{{
                    $t('rule.wizards.ruleForValidFor')
                  }}</span>
                </div>
              </v-flex>

              <v-flex
                sm12
                md8
              >
                <VeeFormGroup
                  validation-key="hostMatchPart"
                  :rules="validationRules.hostMatchPart"
                  :error-bag="validationErrors"
                >
                  <template #default="prop">
                    <v-radio-group
                      v-model="Rule.hostMatchPart"
                      v-validate="prop.rules"
                      :error-messages="prop.firstErrorMessage"
                      row
                      :data-vv-name="prop.validationKey"
                      data-vv-validate-on="blur"
                    >
                      <v-radio value="none">
                        <template #label>
                          {{ $t('form.field.allHosts') }}
                        </template>
                      </v-radio>
                      <v-radio value="uuid">
                        <template #label>
                          <span v-html="$t('form.field.singleHost', { host: Host.name })"/>
                        </template>
                      </v-radio>
                    </v-radio-group>
                  </template>
                </VeeFormGroup>
              </v-flex>
            </v-layout>
          </v-timeline-item>

          <v-timeline-item
            color="primary"
            fill-dot
            icon="edit"
            :hide-dot="!!$vuetify.breakpoint.xsOnly"
            :small="!!$vuetify.breakpoint.smAndDown"
          >
            <v-layout
              row
              wrap
              align-center
            >
              <v-flex
                sm12
                md4
                class="pr-2"
              >
                <div class="section-subheaders mb-2 grey lighten-2 pa-3">
                  <div class="font-weight-medium subheading">
                    {{ $t('rule.wizards.snmpRule.condition') | capitalize }}
                  </div>
                </div>
              </v-flex>

              <v-flex
                sm12
                md8
              >
                <v-layout
                  row
                  wrap
                  align-center
                  justify-space-between
                >
                  <v-flex
                    md2
                    class="pr-1"
                  >
                    <VeeFormGroup
                      validation-key="function"
                      :rules="validationRules.function"
                      :error-bag="validationErrors"
                    >
                      <template #default="prop">
                        <v-select
                          v-model="Rule.function"
                          v-validate="prop.rules"
                          :items="functions"
                          :error-messages="prop.firstErrorMessage"
                          item-text="label"
                          item-value="value"
                          single-line
                          :data-vv-name="prop.validationKey"
                          data-vv-validate-on="blur"
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>

                  <v-flex
                    v-if="Rule['function'] !== 'last'"
                    shrink
                    class="pr-1 text-xs-center"
                  >
                    <label>{{ $t('rule.ofLast') }}</label>
                  </v-flex>

                  <v-flex
                    v-if="Rule['function'] !== 'last'"
                    md2
                    class="pr-1"
                  >
                    <VeeFormGroup
                      validation-key="resultsRange"
                      :rules="validationRules.resultsRange"
                      :error-bag="validationErrors"
                    >
                      <template #default="prop">
                        <v-select
                          v-model="Rule.resultsRange"
                          v-validate="prop.rules"
                          :items="resultsRanges"
                          :error-messages="prop.firstErrorMessage"
                          item-text="label"
                          item-value="value"
                          single-line
                          :data-vv-name="prop.validationKey"
                          data-vv-validate-on="blur"
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>

                  <v-flex
                    shrink
                    class="pr-1 text-xs-center"
                  >
                    <label v-if="Rule['function'] !== 'last'">{{
                      $tc('rule.resultsIs', Rule.resultsRange)
                    }}</label>
                    <label v-else>{{ $t('rule.valueIs') }}</label>
                  </v-flex>

                  <v-flex
                    md3
                    class="pr-1"
                  >
                    <VeeFormGroup
                      validation-key="operator"
                      :rules="validationRules.operator"
                      :error-bag="validationErrors"
                    >
                      <template #default="prop">
                        <v-select
                          v-model="Rule.operator"
                          v-validate="prop.rules"
                          :items="operators"
                          single-line
                          :error-messages="prop.firstErrorMessage"
                          :data-vv-name="prop.validationKey"
                          data-vv-validate-on="blur"
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>

                  <v-flex
                    md2
                    class="pr-1"
                  >
                    <VeeFormGroup
                      validation-key="threshold"
                      :rules="validationRules.threshold"
                      :error-bag="validationErrors"
                      :label="isPercentBasedCheck ? '0-100%' : ''"
                    >
                      <template #default="prop">
                        <v-text-field
                          v-model="Rule.threshold"
                          v-validate="prop.rules"
                          :data-vv-name="prop.validationKey"
                          data-vv-validate-on="blur"
                          :label="prop.label"
                          :error-messages="prop.firstErrorMessage"
                          :single-line="!isPercentBasedCheck"
                          :append-icon="isPercentBasedCheck ? '%' : ''"
                          :maxlength="thresholdFieldMaxlength"
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-timeline-item>

          <v-timeline-item
            color="primary"
            fill-dot
            icon="edit"
            :hide-dot="!!$vuetify.breakpoint.xsOnly"
            :small="!!$vuetify.breakpoint.smAndDown"
          >
            <v-layout
              row
              wrap
              align-center
            >
              <v-flex
                sm12
                md4
                class="pr-2"
              >
                <div class="section-subheaders mb-2 grey lighten-2 pa-3">
                  <span class="font-weight-medium subheading">{{
                    $t('rule.wizards.actionSend')
                  }}</span>
                </div>
              </v-flex>

              <v-flex
                sm12
                md8
              >
                <VeeFormGroup
                  validation-key="alert"
                  :rules="validationRules.alert"
                  :error-bag="validationErrors"
                >
                  <template #default="prop">
                    <v-radio-group
                      v-model="Rule.action"
                      v-validate="prop.rules"
                      :error-messages="prop.firstErrorMessage"
                      row
                      :data-vv-name="prop.validationKey"
                      data-vv-validate-on="blur"
                    >
                      <v-radio value="alert">
                        <template #label>
                          {{ $t('form.field.anAlert') }}
                        </template>
                      </v-radio>
                      <v-radio value="warn">
                        <template #label>
                          {{ $t('form.field.aWarning') }}
                        </template>
                      </v-radio>
                    </v-radio-group>
                  </template>
                </VeeFormGroup>
              </v-flex>

              <v-flex
                xs12
                class="mt-3 pa-3 grey lighten-3"
              >
                {{ summaryText }}
              </v-flex>
            </v-layout>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <v-layout
          row
          wrap
        >
          <v-flex>
            <BackendValidationAlert/>
          </v-flex>

          <v-flex class="text-xs-right">
            <v-btn
              flat
              @click="onCancel"
            >
              {{ $t('button.cancel') }}
            </v-btn>

            <v-btn
              flat
              color="primary"
              type="submit"
            >
              {{ $t('button.addRule') }}
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
    </form>
  </v-dialog>
</template>

<script>
  import {mapActions, mapGetters, mapMutations, mapState} from 'vuex';
  import { set as setValue } from 'dot-prop';

  import useBackendValidation from '@/mixins/useBackendValidation';
  import ruleData from '@/mixins/ruleData';
  import ruleMixin from '@/mixins/rule';

  import Rule from "@/models/Rule";

  export default {
    mixins: [
      useBackendValidation,
      ruleData,
      ruleMixin,
    ],
    data() {
      return {
        Rule: {},
      };
    },
    computed: {
      ...mapState('hosts', {
        dialog: 'addRuleForSNMPDialog',
      }),
      ...mapState('hosts', ['Host', 'selectedItemForNewRule']),
      ...mapGetters('rules', ['getBaseRuleForRuleWizard']),
      validationRules() {
        const validationRules = {};

        setValue(validationRules, 'hostMatchPart.required', true);
        setValue(validationRules, 'alert.required', true);
        setValue(validationRules, 'function.required', true);
        setValue(validationRules, 'resultsRange.required', true);
        setValue(validationRules, 'operator.required', true);
        setValue(validationRules, 'threshold.decimal', true);
        setValue(validationRules, 'threshold.required', true);

        if (this.isPercentBasedCheck) {
          setValue(validationRules, 'threshold.min_value', 0);
          setValue(validationRules, 'threshold.max_value', 100);
        }

        Object.keys(validationRules).forEach((key) => {
          const config = Object.keys(validationRules[key]).map((configKey) => {
            if (validationRules[key][configKey] === true) {
              return configKey;
            }
            return `${configKey}:${validationRules[key][configKey]}`;
          });

          validationRules[key] = config.join('|');
        });

        return validationRules;
      },
      summaryText() {
        return this.$t('rule.wizards.snmpRule.summaryText', {
          checkKey: this.checkKeyLabel,
          host: this.Rule.hostMatchCriteria === 'any' ? 'any host' : this.Host.name,
          action: this.Rule.action === 'alert' ? 'an alert' : 'a warning',
        });
      },
      isPercentBasedCheck() {
        const checkKey = this.Rule.checkKey?.toLowerCase() || '';
        return checkKey.includes('%') || checkKey.includes('percent');
      },
      checkKeyLabel() {
        if (!this.Rule.checkKey) {
          return '';
        }
        return this.ruleDisplay.checkKey[this.Rule.checkKey].label;
      },
    },
    watch: {
      'Rule.hostMatchPart': function () {
        if (this.Rule.hostMatchPart === 'none') {
          this.Rule.hostMatchCriteria = 'any';
        } else {
          this.Rule.hostMatchCriteria = this.Host.id;
        }
      },
      'Rule.function': function () {
        if (this.Rule.function === 'last') {
          this.Rule.resultsRange = 1;
        }
      },
      dialog() {
        if (this.dialog) {
          this.setCheckKey();
          this.setCheckType();
        }
      },
    },
    created() {
      this.resetBaseRule();
      this.setCheckKey();
      this.setCheckType();
    },
    beforeDestroy() {
      this.reset();
    },
    methods: {
      ...mapActions('rules', {
        addRuleAction: 'addRule',
      }),
      ...mapMutations('hosts', ['toggleAddRuleForSNMPDialog']),
      setCheckKey() {
        if (this.selectedItemForNewRule?.key) {
          const formattedKey = this.selectedItemForNewRule.key.replace(/\.[A-z0-9]+/gi, '');
          this.Rule.checkKey = `snmp@${formattedKey}`;
        }
      },
      setCheckType() {
        this.Rule.checkType = this.selectedItemForNewRule.checkType;
      },
      thresholdFieldMaxlength() {
        if (!this.isPercentBasedCheck || !this.Rule.threshold) return;

        const hasDecimal = this.Rule.threshold.toString().includes('.');

        // eslint-disable-next-line consistent-return
        return !hasDecimal ? 3 : false;
      },
      async onSubmit() {
        this.useBackendValidation_reset();

        const result = await this.$validator.validateAll();
        if (!result) return;

        this.addRule(this.Rule);
      },
      addRule(Rule){
        this.addRuleAction({Rule})
            .then(() => {
              this.$emit('on-create', { success: true, Rule });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-create', { success: false, Rule });
            });
      },
      onCancel() {
        this.toggleAddRuleForSNMPDialog();
      },
      reset() {
        this.resetBaseRule();
        this.useBackendValidation_reset();
        this.$validator.reset();
      },
      resetBaseRule() {
        const rule = this.getBaseRuleForRuleWizard('snmpRule');
        this.Rule = new Rule(JSON.parse(JSON.stringify(rule)));
      },
    },
  };
</script>
