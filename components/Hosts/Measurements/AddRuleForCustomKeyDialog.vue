<template>
  <v-dialog
    v-model="dialog"
    lazy
    max-width="950px"
    persistent
  >
    <form
      class="v-card white"
      @submit.prevent="onSubmit()"
    >
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ $t('rule.wizards.customKeyRule.headline', { checkKey: Rule.checkKey }) }}
        </span>

        <v-spacer/>

        <v-btn
          class="mr-0"
          icon
          @click="onCancel()"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text
        :class="{
          'px-3' : !!$vuetify.breakpoint.mdAndDown,
          'px-5' : !$vuetify.breakpoint.mdAndDown
        }"
        class="py-0"
      >
        <v-timeline dense>
          <v-timeline-item
            :hide-dot="!!$vuetify.breakpoint.xsOnly"
            :small="!!$vuetify.breakpoint.smAndDown"
            color="primary"
            fill-dot
            icon="edit"
          >
            <v-layout
              align-center
              row
              wrap
            >
              <v-flex
                class="pr-3"
                md4
                sm12
              >
                <div class="section-subheaders mb-2 grey lighten-2 pa-3">
                  <span class="font-weight-medium subheading">{{
                      $t('rule.wizards.ruleForValidFor')
                    }}</span>
                </div>
              </v-flex>

              <v-flex
                md8
                sm12
              >
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :rules="validationRules.hostMatchPart"
                  validation-key="hostMatchPart"
                >
                  <template #default="prop">
                    <v-radio-group
                      v-model="Rule.hostMatchPart"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :error-messages="prop.firstErrorMessage"
                      data-vv-validate-on="blur"
                      row
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
            :hide-dot="!!$vuetify.breakpoint.xsOnly"
            :small="!!$vuetify.breakpoint.smAndDown"
            color="primary"
            fill-dot
            icon="edit"
          >
            <v-layout
              align-center
              row
              wrap
            >
              <v-flex
                class="pr-2"
                md4
                sm12
              >
                <div class="section-subheaders mb-2 grey lighten-2 pa-3">
                  <div class="font-weight-medium subheading">
                    {{ $t('rule.wizards.customKeyRule.checkKey') | capitalize }}
                  </div>
                </div>
              </v-flex>

              <v-flex
                md8
                sm12
              >
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :rules="validationRules.checkKey"
                  validation-key="checkKey"
                >
                  <template #default="prop">
                    <v-text-field
                      v-model="Rule.checkKey"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :error-messages="prop.firstErrorMessage"
                      data-vv-validate-on="blur"
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>
            </v-layout>
          </v-timeline-item>

          <v-timeline-item
            :hide-dot="!!$vuetify.breakpoint.xsOnly"
            :small="!!$vuetify.breakpoint.smAndDown"
            color="primary"
            fill-dot
            icon="edit"
          >
            <v-layout
              align-center
              row
              wrap
            >
              <v-flex
                class="pr-2"
                md4
                sm12
              >
                <div class="section-subheaders mb-2 grey lighten-2 pa-3">
                  <div class="font-weight-medium subheading">
                    {{ $t('rule.wizards.customKeyRule.condition') | capitalize }}
                  </div>
                </div>
              </v-flex>

              <v-flex
                md8
                sm12
              >
                <v-layout
                  align-center
                  justify-space-between
                  row
                  wrap
                >
                  <v-flex
                    class="pr-1"
                    md2
                  >
                    <VeeFormGroup
                      :error-bag="validationErrors"
                      :rules="validationRules.function"
                      validation-key="function"
                    >
                      <template #default="prop">
                        <v-select
                          v-model="Rule.function"
                          v-validate="prop.rules"
                          :data-vv-name="prop.validationKey"
                          :error-messages="prop.firstErrorMessage"
                          :items="functions"
                          data-vv-validate-on="blur"
                          item-text="label"
                          item-value="value"
                          single-line
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>

                  <v-flex
                    v-if="Rule['function'] !== 'last'"
                    class="pr-1 text-xs-center"
                    shrink
                  >
                    <label>{{ $t('rule.ofLast') }}</label>
                  </v-flex>

                  <v-flex
                    v-if="Rule['function'] !== 'last'"
                    class="pr-1"
                    md2
                  >
                    <VeeFormGroup
                      :error-bag="validationErrors"
                      :rules="validationRules.resultsRange"
                      validation-key="resultsRange"
                    >
                      <template #default="prop">
                        <v-select
                          v-model="Rule.resultsRange"
                          v-validate="prop.rules"
                          :data-vv-name="prop.validationKey"
                          :error-messages="prop.firstErrorMessage"
                          :items="resultsRanges"
                          data-vv-validate-on="blur"
                          item-text="label"
                          item-value="value"
                          single-line
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>

                  <v-flex
                    class="pr-1 text-xs-center"
                    shrink
                  >
                    <label v-if="Rule['function'] !== 'last'">{{
                        $tc('rule.resultsIs', Rule.resultsRange)
                      }}</label>
                    <label v-else>{{ $t('rule.valueIs') }}</label>
                  </v-flex>

                  <v-flex
                    class="pr-1"
                    md3
                  >
                    <VeeFormGroup
                      :error-bag="validationErrors"
                      :rules="validationRules.operator"
                      validation-key="operator"
                    >
                      <template #default="prop">
                        <v-select
                          v-model="Rule.operator"
                          v-validate="prop.rules"
                          :data-vv-name="prop.validationKey"
                          :error-messages="prop.firstErrorMessage"
                          :items="operators"
                          data-vv-validate-on="blur"
                          single-line
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>

                  <v-flex
                    class="pr-1"
                    md2
                  >
                    <VeeFormGroup
                      :error-bag="validationErrors"
                      :label="isPercentBasedCheck ? '0-100%' : ''"
                      :rules="validationRules.threshold"
                      validation-key="threshold"
                    >
                      <template #default="prop">
                        <v-text-field
                          v-model="Rule.threshold"
                          v-validate="prop.rules"
                          :append-icon="isPercentBasedCheck ? '%' : ''"
                          :data-vv-name="prop.validationKey"
                          :error-messages="prop.firstErrorMessage"
                          :label="prop.label"
                          :maxlength="thresholdFieldMaxlength"
                          :single-line="!isPercentBasedCheck"
                          data-vv-validate-on="blur"
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-timeline-item>

          <v-timeline-item
            :hide-dot="!!$vuetify.breakpoint.xsOnly"
            :small="!!$vuetify.breakpoint.smAndDown"
            color="primary"
            fill-dot
            icon="edit"
          >
            <v-layout
              align-center
              row
              wrap
            >
              <v-flex
                class="pr-2"
                md4
                sm12
              >
                <div class="section-subheaders mb-2 grey lighten-2 pa-3">
                  <span class="font-weight-medium subheading">{{
                      $t('rule.wizards.actionSend')
                    }}</span>
                </div>
              </v-flex>

              <v-flex
                md8
                sm12
              >
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :rules="validationRules.alert"
                  validation-key="alert"
                >
                  <template #default="prop">
                    <v-radio-group
                      v-model="Rule.action"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :error-messages="prop.firstErrorMessage"
                      data-vv-validate-on="blur"
                      row
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
                class="mt-3 pa-3 grey lighten-3"
                xs12
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
              color="primary"
              flat
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
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
  import { set as setValue } from 'dot-prop';

  import useBackendValidation from '@/mixins/useBackendValidation';
  import ruleData from '@/mixins/ruleData';

  import Rule from '@/models/Rule';

  export default {
    mixins: [
      useBackendValidation,
      ruleData
    ],
    data() {
      return {
        Rule: {},
      };
    },
    computed: {
      ...mapState('hosts', {
        dialog: 'addRuleForCustomKeyDialog',
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

        setValue(validationRules, 'checkKey.required', true);
        setValue(validationRules, 'checkKey.min', 3);
        setValue(validationRules, 'checkKey.regex', this.customCheckKeyRegExp);

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
        return this.$t('rule.wizards.customKeyRule.summaryText', {
          checkKey: this.Rule.checkKey,
          host: this.Rule.hostMatchCriteria === 'any' ? 'any host' : this.Host.name,
          action: this.Rule.action === 'alert' ? 'an alert' : 'a warning',
        });
      },
      isPercentBasedCheck() {
        const checkKey = this.Rule.checkKey?.toLowerCase() || '';
        return checkKey.includes('%') || checkKey.includes('percent');
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
      ...mapMutations('hosts', ['toggleAddRuleForCustomKeyDialog']),
      setCheckKey() {
        this.Rule.checkKey = this.selectedItemForNewRule.key;
      },
      setCheckType() {
        this.Rule.checkType = this.selectedItemForNewRule.checkType;
      },
      thresholdFieldMaxlength() {
        if (! this.isPercentBasedCheck || ! this.Rule.threshold) return;

        const hasDecimal = this.Rule.threshold.toString().includes('.');

        // eslint-disable-next-line consistent-return
        return ! hasDecimal ? 3 : false;
      },
      async onSubmit() {
        this.useBackendValidation_reset();

        const result = await this.$validator.validateAll();
        if (! result) return;

        this.addRule(this.Rule);
      },
      addRule(Rule) {
        this.addRuleAction({ Rule })
            .then(() => {
              this.$emit('on-create', { success: true, Rule });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-create', { success: false, Rule });
            });
      },
      onCancel() {
        this.toggleAddRuleForCustomKeyDialog();
      },
      reset() {
        this.resetBaseRule();
        this.useBackendValidation_reset();
        this.$validator.reset();
      },
      resetBaseRule() {
        const rule = this.getBaseRuleForRuleWizard('customKeyRule');
        this.Rule = new Rule(JSON.parse(JSON.stringify(rule)));
      },
    },
  };
</script>
