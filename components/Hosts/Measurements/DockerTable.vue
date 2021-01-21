<template>
  <div class="measurements-table">
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
            <v-flex
              xs12
              md5
            >
              <v-text-field
                v-model="search"
                append-icon="search"
                :label="$t('form.field.searchByContainerName') | capitalize"
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
      :rows-per-page-items="rowsPerPage"
      :custom-filter="useFrontendFilter_expressionSearch"
      :hide-actions="items.length < 11"
      item-key="uniqueId"
      disable-initial-sort
    >
      <template #items="props">
        <tr>
          <td>
            <v-tooltip
              class="pointer"
              bottom
            >
              <span
                slot="activator"
                class="font-weight-medium"
              >
                {{ props.item.name }}
              </span>
              <div>
                {{ props.item.id }}
              </div>
            </v-tooltip>
          </td>
          <td>
            <v-tooltip
              bottom
            >
              <span
                slot="activator"
              >
                <v-chip
                  :color="stateColor(props.item.state)"
                  text-color="white"
                  class="ma-0 pointer"
                  small
                >
                  {{ props.item.state.toUpperCase() }}
                </v-chip>
              </span>
              <div>
                {{ props.item.status }}
              </div>
            </v-tooltip>
          </td>
          <td>
            <v-icon
              color="primary"
              small
              class="mr-2"
            >
              fas fa-sd-card
            </v-icon>
            <span>
              {{ props.item.image }}
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
      <template #page-text="props">
        {{
          $t('paging.count', {
            pageStart: props.pageStart,
            pageStop: props.pageStop,
            itemsLength: props.itemsLength,
          })
        }}
      </template>
    </v-data-table>
  </div>
</template>

<script>
import useFrontendFilter from '@/mixins/useFrontendFilter';

  export default {
    components: {},
    mixins: [useFrontendFilter],
    props: {
      items: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        search: '',
        searchColumns: ['name'],
        selectedRule: {},
        headers: [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.name', 1)),
            align: 'left',
            value: 'name',
            sortable: true,
            width: '20%',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.state')),
            align: 'left',
            value: 'state',
            sortable: true,
            width: '1%',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.image')),
            align: 'left',
            value: 'image',
            sortable: true,
          },
        ],
        pagination: {
          sortBy: 'id',
        },
        rowsPerPage: [25, 50, { text: this.$t('phrase.all'), value: -1 }],
      };
    },
    methods: {
      stateColor(state) {
        if (state.toLowerCase() === 'running') return 'success';

        if (state.toLowerCase() === 'stopped') return 'error';

        return 'grey';
      },
    },
  };
</script>
