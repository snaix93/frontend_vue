<template>
  <BaseRuleDialog
    v-if="!isHidden"
    :dialog="dialog"
    @onCancel="onCancel"
    @onSubmit="onSubmit"
  >
    <template #headline>
      <template v-if="Rule.id">
        {{ $t('rule.updateRule') | capitalize }}
      </template>
      <template v-else>
        {{ $t('rule.addrule') }}
      </template>
    </template>

    <template #headline-tooltip>
      <HelpTooltip
        :tooltip="$tooltip('RULE_FORM')"
        orientation="left"
      />
    </template>

    <template #default>
      <BackendValidationAlert/>
      <!--HOST-->
      <RuleRow>
        <template #title>
          {{ $t('rule.dialogSubtitles.host') }}
        </template>
        <template #default>
          <v-layout wrap>
            <v-flex
              class="pr-1"
              sm4
              xs12
            >
              <VeeFormGroup
                :error-bag="err"
                :label="$t('form.field.andAffectedHost')"
                data-cy="hostMatchPartSelectFormGroup"
                validation-key="hostMatchPart"
              >
                <template #default="prop">
                  <v-select
                    v-model="Rule.hostMatchPart"
                    :error-messages="prop.firstErrorMessage"
                    :items="hostMatchPartOptions"
                    box
                    item-disabled="disabled"
                    item-text="label"
                    item-value="value"
                    single-line
                    @change="onHostMatchPartChange"
                  />
                </template>
              </VeeFormGroup>
            </v-flex>
            <v-flex
              v-if="Rule.hostMatchPart !== 'none'"
              class="pr-1"
              sm8
              xs12
            >
              <v-layout
                row
                wrap
              >
                <v-flex
                  v-if="
                    Rule.hostMatchPart === 'name' ||
                      Rule.hostMatchPart === 'connect'
                  "
                  class="text-xs-center"
                  md2
                  xs3
                >
                  <v-icon large>
                    compare_arrows
                  </v-icon>
                  <br><span class="caption">{{ $t('rule.matches') }}</span>
                </v-flex>

                <v-flex>
                  <template v-if="Rule.hostMatchPart === 'uuid'">
                    <VeeFormGroup
                      :error-bag="err"
                      :label="$t('form.field.selectHost') | capitalize"
                      data-cy="hostMatchUuidCriteriaFormGroup"
                      validation-key="hostMatchCriteria"
                    >
                      <template #default="prop">
                        <v-select
                          v-model="Rule.hostMatchCriteria"
                          :error-messages="prop.firstErrorMessage"
                          :items="hosts"
                          box
                          item-disabled="disabled"
                          item-value="id"
                          single-line
                          @change="getSelectedHost(Rule.hostMatchCriteria)"
                        >
                          <template #selection="data">
                            {{ data.item.name }}
                            <span
                              class="caption grey--text text--darken-1 ml-1"
                            >{{ data.item.connect }}</span>
                          </template>

                          <template #item="data">
                            {{ data.item.name }}
                            <span
                              class="caption grey--text text--darken-1 ml-1"
                            >{{ data.item.connect }}</span>
                          </template>
                        </v-select>
                      </template>
                    </VeeFormGroup>
                  </template>

                  <template v-if="Rule.hostMatchPart === 'tag'">
                    <VeeFormGroup
                      :error-bag="err"
                      :label="$t('form.field.enterMatchingTag') | capitalize"
                      data-cy="hostMatchTagCriteriaFormGroup"
                      validation-key="hostMatchCriteria"
                    >
                      <template #default="prop">
                        <v-text-field
                          v-model="Rule.hostMatchCriteria"
                          :error-messages="prop.firstErrorMessage"
                          :hint="$t('rule.useWildcard')"
                          :label="prop.label"
                          box
                          persistent-hint
                          single-line
                        />
                      </template>
                    </VeeFormGroup>
                  </template>

                  <template
                    v-if="
                      Rule.hostMatchPart === 'name' ||
                        Rule.hostMatchPart === 'connect'
                    "
                  >
                    <VeeFormGroup
                      :error-bag="err"
                      :label="$t('form.field.enterMatchingText') | capitalize"
                      data-cy="hostMatchTextCriteriaFormGroup"
                      validation-key="hostMatchCriteria"
                    >
                      <template #default="prop">
                        <v-text-field
                          v-model="Rule.hostMatchCriteria"
                          :error-messages="prop.firstErrorMessage"
                          :hint="$t('rule.useWildcard')"
                          :label="prop.label"
                          box
                          persistent-hint
                        />
                      </template>
                    </VeeFormGroup>
                  </template>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </template>
      </RuleRow>
      <!--CHECK TYPE-->
      <RuleRow>
        <template #title>
          {{ $t('rule.dialogSubtitles.type') }}
        </template>
        <template #default>
          <v-layout wrap>
            <v-flex
              class="pr-1"
              sm4
              xs12
            >
              <VeeFormGroup
                :error-bag="err"
                :label="$options.filters.capitalize($t('form.field.selectCheckType'))"
                data-cy="selectCheckTypeFormGroup"
                validation-key="checkType"
              >
                <template #default="prop">
                  <v-select
                    v-model="Rule.checkType"
                    :error-messages="prop.firstErrorMessage"
                    :items="checkTypeOptions"
                    :label="prop.label"
                    box
                    item-disabled="disabled"
                    item-text="label"
                    item-value="value"
                    single-line
                    @change="onCheckTypeChange"
                  />
                </template>
              </VeeFormGroup>
            </v-flex>
            <v-flex
              v-if="showCheckKey"
              :sm4="hasCustomCheckKey"
              :sm8="!hasCustomCheckKey"
              class="pr-1"
              xs12
            >
              <VeeFormGroup
                :error-bag="err"
                data-cy="checkKeyFormGroup"
                validation-key="checkKey"
              >
                <template #default="prop">
                  <v-select
                    v-model="Rule.checkKey"
                    :error-messages="prop.firstErrorMessage"
                    :items="checkKeys"
                    box
                    item-disabled="disabled"
                    item-text="display"
                    item-value="value"
                    single-line
                    @change="onCheckKeyChange"
                  >
                    <template #item="{ item }">
                      <v-chip
                        v-if="item.hasOwnProperty('active') && !item.active"
                        color="primary"
                        small
                        text-color="white"
                      >
                        {{ item.reason }}
                      </v-chip>
                      {{ item.display }}
                    </template>
                    <template #selection="{ item }">
                      <v-chip
                        v-if="item.hasOwnProperty('active') && !item.active"
                        color="primary"
                        small
                        text-color="white"
                      >
                        {{ item.reason }}
                      </v-chip>
                      <HelpTooltip
                        v-if="item.tooltipKey"
                        :tooltip="$tooltip(item.tooltipKey)"
                        min-width="400px"
                      />
                      {{ item.display }}
                    </template>
                  </v-select>
                </template>
              </VeeFormGroup>
            </v-flex>
            <v-flex
              v-if="hasCustomCheckKey"
              class="pr-1"
              sm4
              xs12
            >
              <VeeFormGroup
                :error-bag="err"
                :label="$t('form.field.customCheckKey')"
                data-cy="customCheckKeyFormGroup"
                validation-key="customCheckKey"
              >
                <template #default="prop">
                  <v-text-field
                    v-model="Rule.customCheckKey"
                    :error-messages="prop.firstErrorMessage"
                    :label="prop.label"
                    box
                    single-line
                  >
                    <template #prepend-inner>
                      <HelpTooltip
                        :tooltip="$tooltip('RULE_CUSTOM_CHECK_KEY')"
                        min-width="400px"
                        orientation="right"
                      />
                    </template>
                  </v-text-field>
                </template>
              </VeeFormGroup>
            </v-flex>
          </v-layout>
        </template>
      </RuleRow>
      <!--CHECK CONDITION-->
      <RuleRow>
        <template #title>
          {{ $t('rule.dialogSubtitles.condition') }}
        </template>
        <template #default>
          <v-layout
            justify-space-between
            wrap
          >
            <v-flex v-if="hasAliasedCheckCondition">
              <VeeFormGroup
                :error-bag="err"
                :label="$t('form.field.andCheck')"
                validation-key="expressionAlias"
              >
                <template #default="prop">
                  <v-select
                    v-model="Rule.expressionAlias"
                    :error-messages="prop.firstErrorMessage"
                    :items="selectedCheckExpressionAlias"
                    box
                    item-disabled="disabled"
                    item-text="display"
                    item-value="value"
                    single-line
                  />
                </template>
              </VeeFormGroup>
            </v-flex>
            <template v-else-if="hasStandardCheckCondition">
              <v-flex
                class="pr-1"
                md2
                sm2
                xs4
              >
                <VeeFormGroup
                  :error-bag="err"
                  :label="$t('form.field.and') | capitalize"
                  validation-key="function"
                >
                  <template #default="prop">
                    <v-select
                      v-model="Rule.function"
                      :error-messages="prop.firstErrorMessage"
                      :items="functions"
                      box
                      item-disabled="disabled"
                      item-text="label"
                      item-value="value"
                      single-line
                      @change="onRuleFunctionChange"
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>

              <v-flex
                v-if="Rule.function !== 'last'"
                class="pr-1 pt-3 text-xs-center"
                shrink
              >
                <label>{{ $t('rule.ofLast') }}</label>
              </v-flex>

              <v-flex
                v-if="Rule.function !== 'last'"
                class="pr-1"
                md2
                sm2
                xs5
              >
                <VeeFormGroup
                  :error-bag="err"
                  validation-key="resultsRange"
                >
                  <template #default="prop">
                    <v-select
                      v-model="Rule.resultsRange"
                      :error-messages="prop.firstErrorMessage"
                      :items="resultsRanges"
                      box
                      item-disabled="disabled"
                      item-text="label"
                      item-value="value"
                      single-line
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>

              <v-flex
                class="pr-1 pt-3 text-xs-center"
                shrink
              >
                <label v-if="Rule.function !== 'last'">{{
                    $tc('rule.resultsIs', Rule.resultsRange)
                  }}</label>
                <label v-else>{{ $t('rule.valueIs') }}</label>
              </v-flex>

              <v-flex
                :md5="!selectedOperator.threshold"
                class="pr-1"
                md3
              >
                <v-layout row>
                  <VeeFormGroup
                    :error-bag="err"
                    validation-key="operator"
                  >
                    <template #default="prop">
                      <v-select
                        v-model="Rule.operator"
                        :error-messages="prop.firstErrorMessage"
                        :items="operators"
                        box
                        item-disabled="disabled"
                        single-line
                      />
                    </template>
                  </VeeFormGroup>
                  <v-tooltip
                    v-if="!!selectedOperator.tooltip"
                    :max-width="400"
                    bottom
                    class="pointer mt-3 ml-2"
                    dark
                  >
                    <v-icon
                      slot="activator"
                      color="grey darken-4"
                      size="21px"
                    >
                      help
                    </v-icon>

                    <div
                      class="pa-2"
                      style="word-wrap: break-word;"
                    >
                      {{ selectedOperator.tooltip }}
                    </div>
                  </v-tooltip>
                </v-layout>
              </v-flex>

              <v-flex
                v-if="!!selectedOperator.threshold"
                class="pr-1"
                md2
                sm2
                xs5
              >
                <VeeFormGroup
                  :error-bag="err"
                  :label="isPercentBasedCheck ? '0-100%' : ''"
                  validation-key="threshold"
                >
                  <template #default="prop">
                    <v-text-field
                      v-model="Rule.threshold"
                      :append-icon="isPercentBasedCheck ? '%' : ''"
                      :error-messages="prop.firstErrorMessage"
                      :label="prop.label"
                      :maxlength="thresholdFieldMaxlength"
                      :single-line="!isPercentBasedCheck"
                      box
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>
            </template>
            <template v-else-if="hasCustomCheckCondition">
              <v-flex
                v-for="(fieldData, fieldKey) in selectedCheckKey.customCheckCondition.fields"
                :key="fieldKey"
                :class="['pr-1', fieldData.colSize]"
              >
                <div
                  v-if="fieldData.type === 'text'"
                  class="pt-3 text-xs-center"
                >
                  <label>{{ fieldData.value }}</label>
                </div>

                <VeeFormGroup
                  v-else
                  :error-bag="err"
                  :label="fieldData.label | capitalize"
                  :validation-key="fieldKey"
                >
                  <template #default="prop">
                    <component
                      :is="fieldData.type"
                      :key="`${Rule.checkKey}_${fieldKey}`"
                      :error-messages="prop.firstErrorMessage"
                      :hint="fieldData.hint"
                      :items="fieldData.items"
                      :label="prop.label"
                      :loading="$wait.is(['rule:fetch-processes']) && fieldData.type === 'v-combobox'"
                      :persistent-hint="!!fieldData.hint"
                      :return-object="false"
                      :search-input.sync="fieldData.autocompleteSearch"
                      :single-line="fieldData.type === 'v-select'"
                      :value="fieldData.model.get()"
                      box
                      hide-no-data
                      @input="fieldData.model.set($event)"
                    >
                      <template #prepend-inner>
                        <HelpTooltip
                          v-if="fieldData.tooltipKey"
                          :tooltip="$tooltip(fieldData.tooltipKey)"
                        />
                      </template>
                    </component>
                  </template>
                </VeeFormGroup>
              </v-flex>
            </template>
          </v-layout>
        </template>
      </RuleRow>
      <!--ACTION-->
      <RuleRow>
        <template #title>
          {{ $t('rule.dialogSubtitles.action') }}
        </template>
        <template #default>
          <v-layout
            justify-space-between
            wrap
          >
            <v-flex
              class="pr-1"
              md4
              xs12
            >
              <VeeFormGroup
                :error-bag="err"
                :label="$t('form.field.do')"
                validation-key="expressionAlias"
              >
                <template #default="prop">
                  <v-select
                    v-model="Rule.action"
                    :error-messages="prop.firstErrorMessage"
                    :items="actionItems"
                    box
                    item-disabled="disabled"
                    item-text="display"
                    item-value="value"
                    single-line
                  >
                    <template
                      v-if="Rule.hostMatchPart !== 'uuid'"
                      #append-item
                    >
                      <v-list-tile>
                        <v-list-tile-content class="grey--text">
                          {{ actions[2].display }}
                          <span class="caption">
                            {{ $t('rule.actions.onlyForSingleHosts') }}
                          </span>
                        </v-list-tile-content>
                        <v-list-tile-action>
                          <HelpTooltip
                            :tooltip="$tooltip('RULE_FORM_IGNORE')"
                            orientation="right"
                            position="top"
                          />
                        </v-list-tile-action>
                      </v-list-tile>
                    </template>
                  </v-select>
                </template>
              </VeeFormGroup>
            </v-flex>

            <v-flex
              md8
              xs12
            >
              <VeeFormGroup
                :error-bag="err"
                :label="$t('form.field.exit') | capitalize"
                validation-key="finish"
              >
                <template #default="prop">
                  <v-checkbox
                    v-model="Rule.finish"
                    :error-messages="prop.firstErrorMessage"
                    :label="prop.label"
                    class="pl-2 mt-2"
                    hide-details
                  >
                    <template #append>
                      <HelpTooltip
                        :tooltip="$tooltip('RULE_FORM_EXIT')"
                        orientation="right"
                      />
                    </template>
                  </v-checkbox>
                </template>
              </VeeFormGroup>
            </v-flex>
          </v-layout>
        </template>
      </RuleRow>
    </template>

    <template #submit-button-text>
      <template v-if="Rule.id">
        {{ $t('rule.buttonUpdateRule') }}
      </template>
      <template v-else>
        {{ $t('rule.buttonAddRule') }}
      </template>
    </template>
  </BaseRuleDialog>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';

  import { set as setValue } from 'dot-prop';
  import { ErrorBag, Validator } from 'vee-validate';
  import BaseRuleDialog from '@/components/Rules/Dialog/Base';
  import RuleRow from '@/components/Rules/Dialog/Row';
  import HelpTooltip from '@/components/App/HelpTooltip';
  import useBackendValidation from '@/mixins/useBackendValidation';

  import ruleMixins from '@/mixins/rule';

  export default {
    components: {
      BaseRuleDialog,
      HelpTooltip,
      RuleRow
    },
    mixins: [
      useBackendValidation,
      ruleMixins
    ],
    props: {
      hosts: {
        type: Array,
        required: false,
      },
    },
    data() {
      return {
        selectedHost: {},
        err: new ErrorBag(),
        checkKeyWatchers: [],
        isHidden: false,
      };
    },
    computed: {
      ...mapState('rules', {
        dialog: 'addRuleDialog',
        Rule: 'selectedRule',
      }),
      selectedOperator() {
        if (!! this.Rule.operator) {
          return this.operators.find(({ value }) => value === this.Rule.operator);
        }

        return {};
      },
      showCheckKey() {
        return this.Rule.checkType.length === 1;
      },
      checkKeys() {
        return this.Rule.checkType
               ? this.getCheckKeyByCheckType()
               : this.checkKeysByCheckType.any;
      },
      actionItems() {
        if (this.Rule.hostMatchPart !== 'uuid') {
          return this.actions.filter(action => action.value !== 'ignore');
        }
        return this.actions;
      },
      selectedCheckKey() {
        if (! this.Rule.checkKey || ! this.Rule.checkType) {
          return this.checkKeysByCheckType.any[0];
        }

        const checkKey = this.getCheckKeyByCheckType().find(
          ({ value }) => value === this.Rule.checkKey,
        );

        return checkKey !== undefined ? checkKey : this.checkKeysByCheckType.any[0];
      },
      selectedCheckExpressionAlias() {
        return this.selectedCheckKey.expressionAliases || [];
      },
      thresholdFieldMaxlength() {
        if (! this.isPercentBasedCheck || ! this.Rule.threshold) return;

        const hasDecimal = this.Rule.threshold.toString().includes('.');

        // eslint-disable-next-line consistent-return
        return ! hasDecimal ? 3 : false;
      },
      validationRules() {
        let validationRules = {
          hostMatchCriteria: {
            required: true,
            regex: '[^;]+',
          },
          checkType: {
            required: true,
          },
          checkKey: {
            required: true,
            checkKeyActive: true,
          },
        };

        if (this.hasAliasedCheckCondition) {
          setValue(validationRules, 'expressionAlias.required', true);
        } else {
          setValue(validationRules, 'function.required', true);
          setValue(validationRules, 'resultsRange.required', true);
          setValue(validationRules, 'operator.required', true);
          setValue(validationRules, 'threshold.decimal', true);
          setValue(validationRules, 'threshold.required', true);

          if (this.isPercentBasedCheck) {
            setValue(validationRules, 'threshold.min_value', 0);
            setValue(validationRules, 'threshold.max_value', 100);
          }
        }

        if (this.hasCustomCheckCondition) {
          validationRules = {
            ...validationRules,
            ...this.selectedCheckKey.customCheckCondition.setup.validation(),
          };
        }

        if (this.hasCustomCheckKey) {
          setValue(validationRules, 'customCheckKey.required', true);
          setValue(validationRules, 'customCheckKey.min', 3);
          setValue(validationRules, 'customCheckKey.regex', this.customCheckKeyRegExp);
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
      isPercentBasedCheck() {
        const display = this.selectedCheckKey.display.toLowerCase();
        return display.includes('%') || display.includes('percent');
      },
      hasAliasedCheckCondition() {
        return !! this.selectedCheckKey?.expressionAliases;
      },
      hasStandardCheckCondition() {
        return !! this.selectedCheckKey?.expression;
      },
      hasCustomCheckCondition() {
        return !! this.selectedCheckKey?.customCheckCondition;
      },
      hasCustomCheckKey() {
        return this.selectedCheckKey.value === this.customCheckKeyPlaceholder;
      },
    },
    watch: {
      dialog: {
        handler(value) {
          if (value) {
            this.isHidden = false;
            if (['cagent', 'customCheck'].includes(this.Rule.checkType[0])) {
              this.prepCustomCheckKeyFor(this.Rule.checkType[0]);
            }
          } else {
            // Removes component to prevent weird flash when another
            // Rule is opened. Vue is reusing stuff and it's making it
            // animate weirdly when opening. This fixes that.
            setTimeout(() => {
              this.isHidden = true;
            }, 500);
          }
        },
        immediate: true
      },
    },
    methods: {
      ...mapActions('rules', {
        addRuleAction: 'addRule',
        updateRuleAction: 'updateRule'
      }),
      ...mapMutations('rules', ['toggleAddRuleDialog', 'resetSelectedRule']),
      prepCustomCheckKeyFor(type) {
        const hasCustomKey = ! this.checkKeysByCheckType[type].map(({ value: v }) => v)
                                                              .includes(this.Rule.checkKey);
        if (hasCustomKey) {
          this.Rule.customCheckKey = this.Rule.checkKey;
          this.Rule.checkKey = this.customCheckKeyPlaceholder;
        }
      },
      getSelectedHost(hostId) {
        [this.selectedHost] = this.hosts.filter(({ id }) => id === hostId);
        if (this.selectedHost !== undefined) {
          this.selectedHost = this.selectedHost.name;
        }
      },
      onHostMatchPartChange() {
        if (! this.dialog) return;

        this.$nextTick(() => {
          this.resetValidation();
          if (this.Rule.hostMatchPart === 'none') {
            this.Rule.hostMatchCriteria = 'any';
          } else if (this.Rule.hostMatchPart === 'uuid' && this.hosts.length) {
            this.Rule.hostMatchCriteria = this.hosts[0].id;
            this.getSelectedHost(this.Rule.hostMatchCriteria);
          } else {
            this.Rule.hostMatchCriteria = null;
          }
        });
      },
      onCheckTypeChange() {
        if (! this.dialog) return;

        this.$nextTick(() => {
          this.resetValidation();
          this.Rule.checkKey = this.getCheckKeyByCheckType()[0].value;
          this.onCheckKeyChange();
        });
      },
      getCheckKeyByCheckType() {
        if (this.Rule.checkType.length === 1) {
          return this.checkKeysByCheckType[this.Rule.checkType[0]];
        }
        return this.checkKeysByCheckType.any;
      },
      onCheckKeyChange() {
        if (! this.dialog) return;

        this.$nextTick(() => {
          this.resetValidation();

          if (this.hasAliasedCheckCondition) {
            this.Rule.expressionAlias = this.selectedCheckExpressionAlias[0].value;
          } else {
            this.Rule.expressionAlias = null;
          }

          this.Rule.customCheckKey = null;

          if (this.hasStandardCheckCondition) {
            this.Rule.function = 'avg';
            this.Rule.resultsRange = 5;
            this.Rule.operator = '=';
            this.Rule.threshold = 1;
          } else {
            this.Rule.function = null;
            this.Rule.resultsRange = null;
            this.Rule.operator = null;
            this.Rule.threshold = null;
          }

          // Remove any custom watchers which may have been setup by
          // previously selected rules with a custom check condition.
          this.customCheckRegisteredWatchers.forEach((unwatch) => {
            unwatch();
          });
          this.customCheckRegisteredWatchers = [];

          if (this.hasCustomCheckCondition) {
            this.selectedCheckKey.customCheckCondition.setup.init(
              this.selectedCheckKey.customCheckCondition
            );
          }
        });
      },
      onRuleFunctionChange() {
        this.$nextTick(() => {
          if (this.Rule.function === 'last') {
            this.Rule.resultsRange = 1;
          }
        });
      },
      createValidator() {
        const validator = new Validator();

        validator.extend('checkKeyActive', {
          getMessage: () => `This rule is not currently active (${this.selectedCheckKey.reason}).`,
          validate: () => ! (this.selectedCheckKey.hasOwnProperty('active') && ! this.selectedCheckKey.active),
        });

        validator.attach({
          alias: this.$t('form.field.hostMatchCriteria'),
          name: 'hostMatchCriteria',
          rules: this.validationRules.hostMatchCriteria,
          getter: () => this.Rule.hostMatchCriteria,
        });

        validator.attach({
          alias: this.$t('form.field.checkType'),
          name: 'checkType',
          rules: this.validationRules.checkType,
          getter: () => this.Rule.checkType,
        });

        if (this.hasCustomCheckKey) {
          validator.attach({
            alias: this.$t('form.field.checkKey'),
            name: 'customCheckKey',
            rules: this.validationRules.customCheckKey,
            getter: () => this.Rule.customCheckKey,
          });
        } else {
          validator.attach({
            alias: this.$t('form.field.checkKey'),
            name: 'checkKey',
            rules: this.validationRules.checkKey,
            getter: () => this.Rule.checkKey,
          });
        }

        validator.attach({
          // alias: this.$t('form.field.searchForProcessName'),
          name: 'keyFunctionValue',
          rules: this.validationRules.keyFunctionValue,
          getter: () => this.Rule.keyFunction.value,
        });

        validator.attach({
          // alias: this.$t('form.field.searchForProcessName'),
          name: 'keyFunctionKey',
          rules: this.validationRules.keyFunctionKey,
          getter: () => this.Rule.keyFunction.key,
        });

        validator.attach({
          alias: this.$t('form.field.resultsRange'),
          name: 'resultsRange',
          rules: this.validationRules.resultsRange,
          getter: () => this.Rule.resultsRange,
        });

        validator.attach({
          alias: this.$t('form.field.operator'),
          name: 'operator',
          rules: this.validationRules.operator,
          getter: () => this.Rule.operator,
        });

        validator.attach({
          alias: this.$t('form.field.threshold'),
          name: 'threshold',
          rules: this.validationRules.threshold,
          getter: () => this.Rule.threshold,
        });

        validator.attach({
          alias: this.$t('form.field.function'),
          name: 'function',
          rules: this.validationRules.function,
          getter: () => this.Rule.function,
        });

        return validator;
      },
      async onSubmit() {
        this.resetValidation();
        const validator = this.createValidator();

        const result = await validator.validateAll();
        if (! result) {
          this.err = validator.errors;
          return;
        }

        const Rule = this.Rule.makeClone();

        if (this.hasCustomCheckCondition
            && this.selectedCheckKey.customCheckCondition.setup.preSubmit
            !== undefined
        ) {
          this.selectedCheckKey.customCheckCondition.setup.preSubmit();
        }

        if (Rule.customCheckKey) {
          Rule.checkKey = Rule.customCheckKey;
        }

        if (Rule.hasId()) {
          this.updateRule(Rule);
        } else {
          this.addRule(Rule);
        }
        this.reset();
      },
      updateRule(Rule) {
        this.updateRuleAction({ Rule })
            .then(() => {
              this.$emit('on-update', { success: true, Rule });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-update', { success: false, Rule });
            });
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
        this.toggleAddRuleDialog();
        this.reset();
      },
      reset() {
        setTimeout(() => {
          this.resetValidation();
        }, 100);
      },
      resetValidation() {
        this.useBackendValidation_reset();
        this.err = new ErrorBag();
      },
    },
  };
</script>
