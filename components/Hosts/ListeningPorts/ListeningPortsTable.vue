<template>
  <div id="listening-ports-table">
    <template>
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
                :label="$t('form.field.searchByAddressOrProtocol') | capitalize"
                single-line
                hide-details
              />
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
      <v-divider/>
    </template>

    <v-data-table
      :headers="headers"
      :items="items"
      :search="search"
      :pagination.sync="pagination"
      :custom-filter="useFrontendFilter_expressionSearch"
      :rows-per-page-items="rowsPerPage"
      :hide-actions="items.length < 11"
      item-key="addr"
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

      <template #items="{ item }">
        <tr>
          <td>
            <span class="font-weight-medium">
              {{ item.addr }}
            </span>
          </td>
          <td>
            <v-chip
              v-if="item.proto"
              class="ma-0"
              small
            >
              {{ item.proto.toUpperCase() }}
            </v-chip>
          </td>
          <td>
            <span v-if="item.pid">
              {{ item.pid }}
            </span>
          </td>
          <td>
            <span v-if="item.program">
              {{ item.program }}
            </span>
          </td>
        </tr>
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
  </div>
</template>

<script>
  import useFrontendFilter from '@/mixins/useFrontendFilter';

  export default {
    mixins: [
      useFrontendFilter
    ],
    props: {
      items: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        search: '',
        searchColumns: ['addr', 'proto'],
        headers: [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.address')),
            align: 'left',
            value: 'addr',
            width: '12%',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.protocol')),
            align: 'left',
            value: 'proto',
            width: '6%',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.pid')),
            align: 'left',
            value: 'pid',
            width: '1%',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.program')),
            align: 'left',
            value: 'program',
            sortable: true,
          },
        ],
        pagination: {
          sortBy: 'addr',
        },
        rowsPerPage: [25, 50, { text: this.$t('phrase.all'), value: -1 }],
      };
    },
  };
</script>
