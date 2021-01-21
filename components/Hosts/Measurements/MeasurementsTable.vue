<template>
  <div class="measurements-table">
    <template v-if="!disableSearch">
      <v-card>
        <v-card-text>
          <v-layout
            align-end
            justify-end
            pb-3
            row
            wrap
          >
            <v-flex md7>
              <slot/>
            </v-flex>
            <v-flex
              md5
              xs12
            >
              <v-text-field
                v-model="search"
                :label="$t('form.field.searchFor', {
                  field: nameColumn || $t('phrase.checkName')
                }) | capitalize"
                append-icon="search"
                hide-details
                single-line
              />
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
      <v-divider/>
    </template>

    <v-data-table
      :custom-filter="useFrontendFilter_expressionSearch"
      :headers="headers"
      :hide-actions="items.length < 11"
      :items="items"
      :pagination.sync="pagination"
      :rows-per-page-items="rowsPerPage"
      :search="search"
      disable-initial-sort
      item-key="key"
    >
      <template #items="{ item }">
        <tr>
          <td>
            <v-tooltip bottom>
              <span
                slot="activator"
                class="pointer font-weight-medium"
              >
                {{ item.name }}
              </span>
              <span>
                {{ $t('host.key') | capitalize }} :
                <span class="font-weight-medium">
                  {{ item.key }}
                </span>
                <br>
                {{ $t('host.rawValue') | capitalize }} :
                {{ item.rawValue }}
              </span>
            </v-tooltip>
          </td>

          <td
            v-if="item.value === null"
            class="text-xs-center"
          >
            <v-tooltip top>
              <v-icon
                slot="activator"
                class="v-tooltip--hint"
                color="grey"
              >
                loop
              </v-icon>
              {{ $t('host.dataUnknown') }}
            </v-tooltip>
          </td>

          <td
            v-else
            class="text-xs-center no-wrap"
          >
            <v-tooltip
              v-if="exceedsTruncateLength(item.value)"
              bottom
            >
              <span
                slot="activator"
                class="pointer"
                v-html="$options.filters.truncate(outputValueForDisplay(item), truncateLength)"
              />
              <span>
                {{ $t('host.rawValue') | capitalize }} :
                {{ item.rawValue }}
              </span>
            </v-tooltip>
            <span
              v-else
              v-html="outputValueForDisplay(item)"
            />
          </td>

          <td>
            <v-progress-linear
              v-if="isPercentageBasedMetric(item)"
              :background-color="
                item.value === null
                  ? 'success'
                  : isIdleBasedCheck(item)
                    ? 'error lighten-1'
                    : 'success'
              "
              :color="
                item.value === null
                  ? 'grey lighten-2'
                  : isIdleBasedCheck(item)
                    ? 'success'
                    : 'error lighten-1'
              "
              :value="item.value"
              class="hidden-xs-only"
              height="12"
            />
          </td>
          <td>
            <v-tooltip right>
              <span
                slot="activator"
                class="pointer"
              >
                {{ formattedTime(item.dataUpdatedAt.local.timestamp) }}
              </span>
              <span>
                {{ item.dataUpdatedAt.local.formatted }}
              </span>
            </v-tooltip>
          </td>
          <td class="pl-2 pr-2 text-no-wrap text-xs-right">
            <template v-if="activateCharts">
              <v-btn
                v-if="!isTextBased(item)"
                :title="$t('button.showGraph') | capitalize"
                class="mx-0"
                icon
                @click="openChart(item)"
              >
                <v-icon>
                  show_chart
                </v-icon>
              </v-btn>
              <v-btn
                v-else-if="!disableTextBasedData"
                :title="$t('button.showData') | capitalize"
                class="mx-0"
                icon
                @click="openChart(item)"
              >
                <v-icon>
                  toc
                </v-icon>
              </v-btn>
            </template>

            <v-tooltip
              v-if="hasRuleWizard(item)"
              left
            >
              <v-btn
                slot="activator"
                class="mx-0"
                icon
                @click="openRuleWizard(item)"
              >
                <v-icon
                  color="secondary"
                  small
                >
                  fas fa-magic
                </v-icon>
              </v-btn>
              {{ $t('button.addARule') | capitalize }}
            </v-tooltip>
          </td>
        </tr>
      </template>
      <template #no-data>
        <div class="text-xs-center">
          {{ $t('message.error.noData') }}
        </div>
      </template>
      <template
        v-if="!disableSearch"
        #no-results
      >
        <div class="text-xs-center">
          {{ $t('message.error.noSearchResults', { term: search }) }}
        </div>
      </template>
      <template #page-text="{ pageStart, pageStop, itemsLength }">
        {{ $t('paging.count', { pageStart, pageStop, itemsLength }) }}
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex';
  import chartMixins from '@/mixins/chart';
  import useDateTime from '@/mixins/useDateTime';
  import useFrontendFilter from '@/mixins/useFrontendFilter';

  export default {
    mixins: [
      chartMixins,
      useDateTime,
      useFrontendFilter,
    ],
    props: {
      items: {
        type: Array,
        required: true,
      },
      graphDatabase: {
        type: String,
        required: false,
      },
      nameColumn: {
        type: String,
        required: false,
      },
      ruleWizard: {
        type: Object,
        required: false,
        default: () => {
        },
      },
      disableSearch: {
        type: Boolean,
        required: false,
        default: false,
      },
      activateCharts: {
        type: Boolean,
        required: false,
        default: false,
      },
      disableTextBasedData: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data() {
      return {
        search: ! this.disableSearch ? '' : undefined,
        searchColumns: ['name'],
        headers: [
          {
            text: this.$options.filters.capitalize(this.nameColumn || this.$t('phrase.checkName')),
            align: 'left',
            value: 'name',
            width: '25%',
            sortable: true,
          },
          {
            text: `${this.$options.filters.capitalize(
              this.$t('phrase.value'),
            )} / ${this.$options.filters.capitalize(this.$t('phrase.unit'))}`,
            align: 'center',
            value: 'valueWithUnit',
            width: '1%',
            sortable: false,
          },
          {
            text: '',
            align: 'left',
            value: 'percentBar',
            sortable: false,
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.lastCheck')),
            align: 'left',
            value: 'lastCheck',
            width: '1%',
            sortable: true,
          },
          {
            text: '',
            align: 'right',
            value: null,
            width: '1%',
            sortable: false,
          },
        ],
        pagination: {
          sortBy: 'name',
        },
        rowsPerPage: [25, 50, { text: this.$t('phrase.all'), value: -1 }],
      };
    },
    computed: {
      truncateLength() {
        let result = 25;
        if (this.$vuetify.breakpoint.xlOnly) result = 65;
        return result;
      },
    },
    methods: {
      ...mapMutations('hosts', [
        'setSelectedItemForNewRule',
        'toggleAddRuleForCustomKeyDialog', 'toggleAddRuleForSNMPDialog'
      ]),
      hasRuleWizard(item) {
        if (! this.ruleWizard || isNaN(item.rawValue)) {
          return false;
        }

        if (this.ruleWizard.checkKeys) {
          return this.ruleWizard.checkKeys.some(key => item.key.includes(key));
        }

        return true;
      },
      isPercentageBasedMetric({ unit }) {
        return unit === '%';
      },
      isIdleBasedCheck({ key }) {
        return /(idle|free|available)/i.test(key.toLowerCase());
      },
      outputValueForDisplay(item) {
        // if key contains "success" then show red or green light
        if (item.key.toLowerCase().includes('success')) {
          const title = item.value ? 'Success' : 'Fail';
          const statusLight = item.value ? 'status-light--green' : 'status-light--red';

          return `<div class="layout justify-space-around"><span title="${title}" class="status-light ${statusLight}"></span></div>`;
        }

        return `${item.value}${item.unit || ''}`;
      },
      openChart(item) {
        this.$emit('open-chart', { measurement: item, graphDatabase: this.graphDatabase });
      },
      isTextBased({ rawValue, key }) {
        if (typeof rawValue === 'string') return true;
        return this.chart_isTextBased(key);
      },
      openRuleWizard(item) {
        this.setSelectedItemForNewRule(Object.assign({
          checkType: this.ruleWizard.checkType,
        }, item));

        if (this.ruleWizard.checkType[0] === 'snmpCheck') {
          this.toggleAddRuleForSNMPDialog();
        } else {
          this.toggleAddRuleForCustomKeyDialog();
        }
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .measurements-table >>> .status-light
    height: 20px
    width: 20px
    background-color: #bbbbbb
    border-radius: 50%
    display: inline-block

    &--red
      background-color: #cd1917

    &--green
      background-color: #2b7f19
</style>
