<template>
  <div id="services-table">
    <v-card>
      <v-card-text>
        <v-layout
          row
          wrap
          justify-end
          align-end
          pb-3
        >
          <v-flex md7>
            <slot/>
          </v-flex>
          <v-flex
            xs12
            md5
          >
            <v-text-field
              v-model="search"
              append-icon="search"
              :label="$t('form.field.searchFor', {
                field: $t('form.field.serviceName')
              }) | capitalize"
              single-line
              hide-details
            />
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
    <v-divider/>

    <v-data-table
      :headers="headers"
      :items="items"
      :search="search"
      :pagination.sync="pagination"
      :custom-filter="useFrontendFilter_expressionSearch"
      :rows-per-page-items="rowsPerPage"
      :hide-actions="items.length < 11"
      item-key="name"
      disable-initial-sort
    >
      <template #header-cell="{ header }">
        {{ header.text }}

        <template v-if="header.value === 'state'">
          <HelpTooltip
            :getter="$t('host.services.stateTooltip')"
            class="mx-1 table--help-tooltip"
            orientation="bottom"
          >
            <v-icon
              size="21px"
              color="primary"
            >
              help
            </v-icon>
          </HelpTooltip>
        </template>
      </template>

      <template #items="props">
        <tr>
          <td>
            <span class="font-weight-medium">
              {{ props.item.name || props.item.display_name }}
            </span>
          </td>
          <td>
            <v-chip
              v-if="props.item.state"
              :color="stateColor(props.item.state)"
              class="text-uppercase"
              text-color="white"
              small
            >
              {{ $t(`host.serviceStates.${props.item.state.replace('-','')}`) }}
            </v-chip>
          </td>

          <td>
            <p
              v-if="exceedsTruncateLength(props.item.description)"
              class="pointer description"
            >
              <u><span @click="props.expanded = !props.expanded">{{
                props.item.description | truncate(truncateLength)
              }}</span></u>
            </p>

            <p
              v-else
              class="description"
            >
              {{ props.item.description }}
            </p>
          </td>

          <td class="pl-2 pr-2 text-no-wrap text-xs-right">
            <v-tooltip left>
              <v-btn
                slot="activator"
                icon
                class="mx-0"
                @click="createRuleForService(props.item)"
              >
                <v-icon
                  small
                  color="secondary"
                >
                  fas fa-magic
                </v-icon>
              </v-btn>
              {{ $t('button.addARule') | capitalize }}
            </v-tooltip>

            <v-btn
              icon
              class="mx-0"
              :disabled="!exceedsTruncateLength(props.item.description)"
              @click="props.expanded = !props.expanded"
            >
              <v-icon>
                <template v-if="!props.expanded">
                  expand_more
                </template>
                <template v-else>
                  expand_less
                </template>
              </v-icon>
            </v-btn>
          </td>
        </tr>
      </template>

      <template #expand="{ item }">
        <v-card
          v-if="exceedsTruncateLength(item.description)"
          flat
        >
          <v-card-text>
            <pre class="description">
                 <kbd class="pa-3">{{ item.description }}</kbd>
              </pre>
          </v-card-text>
        </v-card>
      </template>

      <template #no-data>
        <div class="text-xs-center">
          {{ $t('message.error.noData') }}
        </div>
      </template>
      <template #no-results>
        <div class="text-xs-center">
          {{ $t('message.error.noSearchResults', { term: search }) }}
        </div>
      </template>
      <template #page-text="{ pageStart, pageStop, itemsLength }">
        {{ $t('paging.count', { pageStart, pageStop, itemsLength }) }}
      </template>
    </v-data-table>

    <AddRuleForServiceDialog
      v-if="addRuleForServiceDialog"
      :Host="Host"
      @on-create="onAddRuleForService"
    />
  </div>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import HelpTooltip from '@/components/App/HelpTooltip';
  import AddRuleForServiceDialog from '@/components/Hosts/Services/AddRuleForServiceDialog';

  import useFrontendFilter from '@/mixins/useFrontendFilter';

  export default {
    components: { HelpTooltip, AddRuleForServiceDialog },
    mixins: [useFrontendFilter],
    props: {
      items: {
        type: Array,
        required: true,
      },
      Host: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        search: '',
        searchColumns: ['name'],
        headers: [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.name', 1)),
            align: 'left',
            value: 'name',
            width: '18%',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.state')),
            align: 'left',
            value: 'state',
            width: '1%',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('phrase.description'),
            ),
            align: 'left',
            value: 'description',
            sortable: true,
          },
          {
            text: '',
            align: 'right',
            width: '1%',
            value: null,
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
      ...mapState('hosts', ['addRuleForServiceDialog']),
      truncateLength() {
        return 68;
      }
    },
    methods: {
      ...mapMutations('hosts', ['setSelectedServiceForNewRule', 'toggleAddRuleForServiceDialog']),
      createRuleForService(item) {
        this.setSelectedServiceForNewRule(Object.assign({}, item))
        this.toggleAddRuleForServiceDialog();
      },
      onAddRuleForService({ success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.ruleAddFromWizardSuccess'));
          this.toggleAddRuleForServiceDialog();
        } else {
          this.$flash.error(this.$t('message.error.ruleAdd'));
        }
      },
      stateColor(state) {
        if (state.toLowerCase() === 'running') return 'success';

        if (state.toLowerCase() === 'exited') return 'orange';

        if (state.toLowerCase() === 'failed') return 'error';

        return 'primary';
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .description
    margin: 0
    padding: 6px
    white-space: normal
    overflow: auto

    kbd
      width: 100%
</style>
