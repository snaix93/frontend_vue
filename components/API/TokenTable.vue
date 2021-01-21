<template>
  <div id="members-table">
    <v-data-table
      v-if="tokens"
      :headers="headers"
      :hide-actions="numberOfTokens <= rowsPerPage[0]"
      :items="tokens"
      :rows-per-page-items="rowsPerPage"
      :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
      data-cy="apiTokensList"
      disable-initial-sort
      item-key="id"
    >
      <template #items="props">
        <td class="pr-2">
          <v-tooltip
            :disabled="props.item.name.length < nameTruncateLength"
            right
          >
            <span>
              {{ props.item.name }}
            </span>
            <span slot="activator">
              {{ props.item.name | truncate(nameTruncateLength) }}
            </span>
          </v-tooltip>
        </td>
        <td class="text-no-wrap px-2">
          <CopyField
            :message="$t('message.success.tokenCopy')"
            :success="isLastCopiedToken(props.item)"
            :to-copy="props.item.token"
            class="api--token-field"
            @copy="onCopy"
          >
            {{ props.item.token }}
          </CopyField>
        </td>
        <td class="text-no-wrap px-2">
          <v-tooltip
            :disabled="$vuetify.breakpoint.xlOnly"
            right
          >
            <span>
              {{ $t('api.capabilities.read') | capitalize }}
            </span>

            <v-chip
              slot="activator"
              class="api--capability text-uppercase mx-0"
              color="grey"
              label
              outline
              small
              text-color="grey darken-3"
            >
              <template v-if="$vuetify.breakpoint.lgAndDown">
                R
              </template>
              <template v-else>
                {{ $t('api.capabilities.read') | capitalize }}
              </template>
            </v-chip>
          </v-tooltip>

          <v-tooltip
            v-if="props.item.capability === 'rw'"
            :disabled="$vuetify.breakpoint.xlOnly"
            right
          >
            <span>
              {{ $t('api.capabilities.write') | capitalize }}
            </span>

            <v-chip
              slot="activator"
              class="api--capability text-uppercase mx-0"
              color="grey"
              label
              outline
              small
              text-color="grey darken-3"
            >
              <template v-if="$vuetify.breakpoint.lgAndDown">
                W
              </template>
              <template v-else>
                {{ $t('api.capabilities.write') | capitalize }}
              </template>
            </v-chip>
          </v-tooltip>
        </td>
        <td class="px-2">
          <v-tooltip
            v-if="props.item.lastUsageTimeStamp"
            :disabled="!props.item.lastUsageIpAddress"
            bottom
          >
            <span>
              {{
                $t('api.lastUsedBy', {
                  ip: props.item.lastUsageIpAddress,
                  time: timeAgo(props.item.lastUsageTimeStamp)
                }) | capitalize
              }}
            </span>
            <span slot="activator">
              {{ timeAgo(props.item.lastUsageTimeStamp) }}
            </span>
          </v-tooltip>
          <span v-else>
            {{ $t('phrase.never') | capitalize }}
          </span>
        </td>
        <td class="px-2">
          {{ formattedDate(props.item.createTimestamp) }}
        </td>
        <td class="text-xs-right px-2">
          <v-btn
            :title="$t('button.deleteToken') | capitalize"
            class="ma-0"
            color="error"
            flat
            icon
            @click="deleteWithConfirmation(props.item)"
          >
            <v-icon>
              delete
            </v-icon>
          </v-btn>
        </td>
      </template>
      <template #no-results>
        <div class="text-xs-center">
          {{ $t('message.error.noSearchResults', { term: filters.search }) }}
        </div>
      </template>
      <template #no-data>
        <TableNoData :is-loading="$fetchState.pending"/>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import CopyField from '@/components/App/CopyField';
  import useDateTime from '@/mixins/useDateTime';
  import TableNoData from '@/components/App/TableNoData';

  export default {
    components: {
      TableNoData,
      CopyField,
    },
    mixins: [
      useDateTime,
    ],
    async fetch() {
      await this.getTokens();
    },
    data() {
      return {
        headers: [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.name', 1)),
            align: 'left',
            sortable: false,
            value: 'name',
            class: 'pr-2',
            width: '5%',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.token', 1)),
            align: 'left',
            sortable: false,
            value: 'token',
            class: 'px-2',
            width: '10%',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.permission', 1)),
            align: 'left',
            sortable: false,
            value: 'capability',
            class: 'px-2',
            width: '5%',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.lastUsed')),
            align: 'left',
            sortable: false,
            value: 'lastUsageTimeStamp',
            class: 'px-2',
            width: '5%',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.createdAt')),
            align: 'left',
            sortable: false,
            value: 'createTimestamp',
            class: 'px-2',
            width: '5%',
          },
          {
            text: null,
            align: 'right',
            sortable: false,
            value: null,
            class: 'pl-2',
            width: '1%',
          },
        ],
        rowsPerPage: [10, 25, 50, { text: this.$t('phrase.all'), value: -1 }],
        selectedToken: {},
        lastCopiedToken: {},
      };
    },
    computed: {
      ...mapState('api', [
        'tokens',
      ]),
      numberOfTokens() {
        return this.tokens.length || 0;
      },
      nameTruncateLength() {
        let result = 20;

        if (this.$vuetify.breakpoint.xlOnly) result = 50;

        return result;
      },
    },
    methods: {
      ...mapActions('api', ['getTokens']),
      ...mapMutations('api', ['setSelectedToken', 'toggleDeleteDialog']),
      isLastCopiedToken({ token }) {
        return this.lastCopiedToken === token;
      },
      onCopy(token) {
        this.lastCopiedToken = token;
      },
      deleteWithConfirmation(token) {
        this.setSelectedToken(token);
        this.toggleDeleteDialog();
      },
    },
  };
</script>
