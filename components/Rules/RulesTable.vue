<template>
  <div class="rules-table">
    <BackendValidationAlert/>
    <v-data-table
      :key="datatableKey"
      :headers="headers"
      :items="rules"
      data-cy="rulesList"
      disable-initial-sort
      hide-actions
      item-key="id"
    >
      <template #items="{ item: Rule }">
        <tr :class="ruleTableRowClass(Rule)">
          <!--DRAG INDICATOR-->
          <td class="drag-handle text-xs-center pl-0 pr-0 rule-table-border-right">
            <span>
              <v-icon>
                drag_indicator
              </v-icon>
            </span>
          </td>
          <!--HOST-->
          <td>
            <v-icon
              small
              v-html="ruleDisplay.host[Rule.hostMatchPart].icon"
            />
            <template v-if="Rule.hostMatchPart === 'none'">
              {{ $t('rule.hostMatchPartPhrases.all') | capitalize }}
            </template>
            <template
              v-else-if="Rule.hostMatchPart === 'uuid' && Rule.hostMatchCriteria"
            >
              <v-tooltip
                v-if="hostById(Rule.hostMatchCriteria).connect"
                :max-width="400"
                :open-delay="50"
                bottom
                dark
              >
                <div
                  slot="activator"
                  class="d-inline pointer dashed-underline"
                >
                  {{ hostById(Rule.hostMatchCriteria).name | capitalize }}
                </div>
                <div
                  v-if="hostById(Rule.hostMatchCriteria).connect"
                  class="pa-2"
                >
                  Connect:
                  {{ hostById(Rule.hostMatchCriteria).connect }}
                </div>
              </v-tooltip>
              <div
                v-else
                class="d-inline"
              >
                {{ hostById(Rule.hostMatchCriteria).name | capitalize }}
              </div>
            </template>
            <template
              v-else-if="Rule.hostMatchPart === 'connect' && Rule.hostMatchCriteria"
            >
              <span>{{ Rule.hostMatchCriteria }}</span>
            </template>
            <template
              v-else-if="Rule.hostMatchPart === 'tag' && Rule.hostMatchCriteria"
            >
              <span>{{ Rule.hostMatchCriteria }}</span>
            </template>
            <template v-else-if="Rule.hostMatchCriteria">
              <span>{{ Rule.hostMatchCriteria | capitalize }}</span>
            </template>
          </td>
          <!--CHECK TYPE + KEY-->
          <td>
            <v-icon
              class="mr-1"
              small
              v-html="ruleDisplay.checkType[resolveCheckType(Rule.checkType)].icon"
            />
            <template v-if="!['any'].includes(resolveCheckType(Rule.checkType))">
              {{
                ruleDisplay.checkType[resolveCheckType(Rule.checkType)]
                ? ruleDisplay.checkType[resolveCheckType(Rule.checkType)].labelShort
                : resolveCheckType(Rule.checkType) | capitalize
              }}
              -
            </template>

            <template v-if="isProcessMatchRule(Rule)">
              <v-tooltip
                :max-width="400"
                :open-delay="50"
                bottom
                dark
              >
                <span
                  slot="activator"
                  v-html="renderCheckKeyForProcessMatch(Rule)"
                />

                <div
                  class="pa-2"
                  style="word-wrap: break-word;"
                >
                  {{ Rule.keyFunction.value }}
                </div>
              </v-tooltip>
            </template>

            <template v-else>
              <template v-if="!!ruleDisplay.checkKey[Rule.checkKey]">
                {{ ruleDisplay.checkKey[Rule.checkKey].label | capitalize }}
                <template v-if="
                  !!ruleDisplay.checkKey[Rule.checkKey].prependSeverity
                    && !!ruleDisplay.action[Rule.action]
                ">
                  ({{ ruleDisplay.action[Rule.action].prependCheckKey | capitalize }})
                </template>
              </template>
              <template v-else>
                "{{ Rule.checkKey }}"
              </template>
            </template>
          </td>
          <!--CHECK CONDITION-->
          <td>
            <AppChip
              :color="ruleDisplay.checkKey.default.color"
              class="lighten-2 px-1"
              small
              text-color="grey darken-3"
            >
              <template v-if="hasCustomCheckConditionDisplay(Rule)">
                {{ renderCustomCheckConditionDisplay(Rule) | capitalize }}
              </template>

              <template v-else-if="!Rule.expressionAlias">
                {{ $t('rule.functions.' + Rule.function) | capitalize }}
                <template v-if="Rule.function === 'last'">
                  {{ $t('rule.valueIs') }}
                </template>
                <template v-else>
                  {{ $t('rule.ofLast') }} {{ Rule.resultsRange }}
                  {{ $tc('rule.resultsIs', Rule.resultsRange) }}
                </template>
                <template v-if="!!ruleDisplay.expressionOperator[Rule.operator]">
                  {{ ruleDisplay.expressionOperator[Rule.operator].label }}
                </template>
                <template v-else>
                  {{ Rule.operator }}
                </template>
                <template
                  v-if="
                    !ruleDisplay.expressionOperator[Rule.operator]
                      || !!ruleDisplay.expressionOperator[Rule.operator].threshold
                  "
                >
                  {{ Rule.threshold }}
                  {{ isPercentBasedCheck(Rule) ? '%' : '' }}
                </template>
              </template>

              <template v-else>
                {{
                  ruleDisplay.expressionAlias[Rule.expressionAlias]
                  ? ruleDisplay.expressionAlias[Rule.expressionAlias].label
                  : Rule.expressionAlias
                }}
              </template>
            </AppChip>
          </td>
          <!--ALERT ICONS-->
          <td class="text-xs-center pl-0 pr-0">
            <v-avatar
              :color="ruleDisplay.action[Rule.action].color"
              size="25"
            >
              <v-icon
                color="white"
                small
              >
                {{ ruleDisplay.action[Rule.action].icon }}
              </v-icon>
            </v-avatar>
          </td>
          <!--ACTIONS-->
          <td class="text-xs-right pr-1">
            <v-layout align-center>
              <v-flex shrink>
                <v-switch
                  v-model="Rule.active"
                  class="my-0 py-0"
                  data-cy="ruleActiveToggle"
                  hide-details
                  @change="updateRuleActiveState(Rule)"
                />
              </v-flex>

              <v-flex shrink>
                <v-menu
                  v-show="!isCustomCheckTextBasedAlertOrWarningRule(Rule)"
                  :disabled="isCagentModulesRule(Rule)"
                  bottom
                  left
                >
                  <v-btn
                    slot="activator"
                    :disabled="isCagentModulesRule(Rule)"
                    :loading="$wait.is($WAIT_FOR.RULE.DELETE_ID(Rule.id))"
                    class="mx-0 my-0"
                    data-cy="ruleActionsButton"
                    icon
                    transition="scale-transition"
                  >
                    <v-icon>more_vert</v-icon>
                  </v-btn>

                  <v-list dense>
                    <v-list-tile
                      class="qa-edit"
                      data-cy="editRuleButton"
                      @click="editItem(Rule)"
                    >
                      <v-list-tile-action>
                        <v-icon color="grey darken-3">
                          edit
                        </v-icon>
                      </v-list-tile-action>
                      <v-list-tile-title>
                        {{ $t('button.edit') | capitalize }}
                      </v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile
                      class="qa-delete"
                      data-cy="deleteRuleButton"
                      @click="onDeleteConfirm(Rule)"
                    >
                      <v-list-tile-action>
                        <v-icon color="error">
                          delete
                        </v-icon>
                      </v-list-tile-action>
                      <v-list-tile-title>
                        {{ $t('button.delete') | capitalize }}
                      </v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </v-flex>
            </v-layout>
          </td>
        </tr>
      </template>
      <template #no-data>
        <TableNoData :is-loading="$fetchState.pending"/>
      </template>
    </v-data-table>
    <AppWait
      :wait="initialLoadComplete && $fetchState.pending"
      height="100%"
    />
    <RuleDeleteDialog
      v-if="deleteDialog"
      @on-delete="onDelete"
    />
  </div>
</template>

<script>
  import Sortable from 'sortablejs';
  import { get as getValue } from 'dot-prop';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import RuleDeleteDialog from '@/components/Rules/RuleDeleteDialog';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import AppWait from '@/components/App/AppWait';
  import AppChip from '@/components/App/AppChip';
  import ruleMixins from '@/mixins/rule';
  import RuleModel from '@/models/Rule';
  import TableNoData from '@/components/App/TableNoData';

  export default {
    components: {
      TableNoData,
      RuleDeleteDialog,
      AppWait,
      AppChip
    },
    mixins: [
      useBackendValidation,
      ruleMixins,
    ],
    props: {
      hosts: {
        type: Array,
        required: false,
      },
    },
    data() {
      return {
        initialLoadComplete: false,
        datatableKey: 0,
        headers: [
          { sortable: false, class: 'pl-4 pr-3' },
          { text: this.$tc('phrase.host', 1).toUpperCase(), sortable: false },
          {
            text: this.$tc('phrase.checkType', 1).toUpperCase(),
            sortable: false,
          },
          {
            text: this.$tc('phrase.checkCondition', 1).toUpperCase(),
            sortable: false,
          },
          {
            text: this.$tc('phrase.action', 2).toUpperCase(),
            sortable: false,
            align: 'center',
            class: 'px-2',
          },
          { sortable: false, align: 'right' },
        ],
      };
    },
    computed: {
      ...mapState('rules', [
        'deleteDialog',
        'selectedRule',
        'rules',
        'Rule',
      ]),
      numberOfRules() {
        return this.rules.length;
      },
    },
    async fetch() {
      await this.getRulesAction();
      setTimeout(() => {
        this.initialLoadComplete = true;
      }, 200);
    },
    mounted() {
      // wait for pagination presets to load
      this.initSortable();
    },
    destroyed() {
      if (this.sort !== undefined) {
        this.sort.destroy();
      }
    },
    methods: {
      ...mapActions('rules', {
        getRulesAction: 'getRules',
        deleteRuleAction: 'deleteRule',
        updateRulePositionAction: 'updateRulePosition',
      }),
      ...mapMutations('rules', [
        'setRules',
        'setSelectedRule',
        'resetSelectedRule',
        'toggleDeleteDialog',
        'toggleAddRuleDialog',
      ]),
      initSortable() {
        this.sort = Sortable.create(
          document.querySelector('.v-datatable tbody'),
          {
            animation: 250,
            handle: '.drag-handle',
            draggable: '.draggable',
            onEnd: ({ newIndex, oldIndex }) => this.reorderRules(newIndex, oldIndex),
          },
        );
      },
      renderCheckKeyForProcessMatch({ checkKey }) {
        const checkKeyLabel = this.ruleDisplay.checkKey[checkKey].label;
        const str = checkKeyLabel
          .split('(')
          .filter(v => v.indexOf(')') > -1)
          .map(v => v.split(')')[0])[0];

        return checkKeyLabel.replace(
          str,
          `<span class="pointer dashed-underline">${str}</span>`,
        );
      },
      resolveCheckType(checkType) {
        const reducer = (accum, check) => accum + this.$options.filters.capitalize(check);
        const resolvedCheckType = checkType.length === 1
                                  ? checkType[0]
                                  : checkType.reduce(reducer, '');
        return resolvedCheckType.charAt(0).toLowerCase() + resolvedCheckType.slice(1);
      },
      ruleTableRowClass(Rule) {
        return [
          `qa-rule-${this.checkKeyClassName(Rule.checkKey)}`,
          'draggable',
          {
            'is-selected': this.$wait.is(this.$WAIT_FOR.RULE.ALL_ID(Rule.id)),
            'qa-finish': Rule.finish,
            'rule-row-inactive inactive-rule-overlay qa-inactive': ! Rule.active,
            'rule-row-finish': Rule.finish && Rule.active,
            'rule-row-active': ! Rule.finish && Rule.active,
          },
        ];
      },
      hostById(hostId) {
        const host = this.hosts.find(host => host.id === hostId);

        if (host) {
          return {
            name: host.name,
            connect: host.connect || null,
            hostId,
          };
        }

        return hostId;
      },
      updateRuleActiveState(Rule) {
        this.setSelectedRule(Rule);
        this.rule_toggleRuleActiveState(this.selectedRule);
      },
      reorderRules(newIndex, oldIndex) {
        this.useBackendValidation_reset();
        this.sort.option('disabled', true);

        const rules = JSON.parse(JSON.stringify(this.rules));

        // Get the rule that was dragged and remove from array of rules
        const rule = rules.splice(oldIndex, 1)[0];

        // Now reinsert dragged rule back into array in new position
        rules.splice(newIndex, 0, rule);

        // Reorder the position property inside each rule based on new order
        rules.forEach((rule, index) => {
          rule.position = index + 1;
        });

        // Send the moved rule up to the server to change the position there too.
        const Rule = new RuleModel({ ...rule });
        this.updateRulePositionAction({ Rule })
            .then(async () => {
              await this.getRulesAction();
              this.$emit('on-update', { success: true, Rule });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-update', { success: false, Rule });
            })
            .finally(() => {
              this.sort.option('disabled', false);
              // force datatable to re-render with the new rule list
              this.forceDatatableRerender();
            });
      },
      forceDatatableRerender() {
        // forces Vue to re-render component!
        this.datatableKey += 1;
        this.sort.destroy();
        this.$nextTick(() => this.initSortable());
      },
      onDeleteConfirm(Rule) {
        this.setSelectedRule(Rule);
        this.toggleDeleteDialog();
      },
      isCustomCheckTextBasedAlertOrWarningRule({ checkKey }) {
        return checkKey === '*alert' || checkKey === '*warning';
      },
      isProcessMatchRule({ checkKey }) {
        return checkKey && checkKey.includes('proc.list');
      },
      isCagentModulesRule({ checkKey, checkType }) {
        return checkType.indexOf('cagent') !== -1 && checkKey === 'modules';
      },
      isPercentBasedCheck(Rule) {
        if (! Rule.checkKey || ! Rule.checkType) return false;

        const check = this.checkKey(Rule);

        if (check === undefined) return false;
        return check.display.includes('%') || check.display.toLowerCase().includes('percent');
      },
      hasCustomCheckCondition(Rule) {
        const checkKey = this.checkKey(Rule);
        return checkKey && checkKey.customCheckCondition !== undefined;
      },
      checkKey(Rule) {
        return this.checkKeysByCheckType[this.resolveCheckType(Rule.checkType)]?.find(
          ({ value }) => value === Rule.checkKey,
        );
      },
      hasCustomCheckConditionDisplay(Rule) {
        return (
          this.hasCustomCheckCondition(Rule)
          && this.checkKey(Rule).customCheckCondition.display !== undefined
        );
      },
      onDelete({ Rule, success = true }) {
        this.getRulesAction();
        this.$emit('on-delete', { Rule, success });
      },
      renderCustomCheckConditionDisplay(Rule) {
        const customDisplay = this.checkKey(Rule).customCheckCondition.display;
        let { text } = customDisplay;
        Object.entries(customDisplay.key).forEach(([key, value]) => {
          if (typeof value === 'function') {
            value = value(Rule);
          } else {
            value = getValue(Rule, value);
          }

          text = text.replace(new RegExp(`{${key}}`, 'gi'), value);
        });

        return text;
      },
      editItem(Rule) {
        this.setSelectedRule(Rule);
        if (! this.isCustomCheckTextBasedAlertOrWarningRule(Rule)) {
          setTimeout(() => this.toggleAddRuleDialog(), 10);
        }
      },
      deleteItem(Rule) {
        this.useBackendValidation_reset();
        this.deleteRuleAction({ Rule })
            .then(() => {
              this.$emit('on-delete', { success: true, Rule });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, Rule });
            });
      },
      checkKeyClassName(key) {
        return key.replace(/[.*]/g, '');
      },
    },
  };
</script>

<style lang="stylus">
  .rules-table
    .rule-row-active > td:first-child
      box-shadow: inset 3px 0 0 0 #69cb6a;

    .rule-row-inactive > td:first-child
      box-shadow: inset 3px 0 0 0 #9e9e9e;

    .rule-row-finish > td:first-child
      box-shadow: inset 3px 0 0 0 darken(#d6d6d6, 55%);

    //box-shadow: inset 3px 0 0 0 darken(#D6D6D6, 55%), inset 0 -2px 0 0 darken(#D6D6D6, 55%)

    .rule-row-finish > td
      //box-shadow: inset 0 -2px 0 0 darken(#D6D6D6, 55%);
    .rule-row-inactive
      opacity: 0.7
      background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAALElEQVQYV2NkwA3SGHHIpTEwMMzCJgmWAGlCl4RLoEuiSCBLYkjAJLFKgCQBSF8GbnKTsi8AAAAASUVORK5CYII=") repeat !important;

    .v-icon.v-icon--disabled
      color: rgba(0, 0, 0, .2) !important;

    .drag-handle
      cursor: move;
      cursor: -webkit-grabbing;

    .rule-table-border-right
      border-right: 1px solid #d6d6d6;

    .rule-table-border-left
      border-left: 1px solid #d6d6d6;
</style>
