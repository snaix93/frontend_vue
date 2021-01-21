<template>
  <v-dialog
    scrollable
    persistent
    lazy
    :value="dialog"
    max-width="1190px"
  >
    <v-card>
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ $t('recipients.logs') | capitalize }}
        </span>
        <v-spacer/>
        <v-btn
          icon
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider/>
      <div class="pa-0 position-relative">
        <v-card-text>
          <RangeDatePicker
            @on-input="onDatePickerInput"
          />
          <v-layout
            row
            wrap
            justify-end
            align-middle
            pb-2
          >
            <v-flex
              shrink
              :class="{
                'pr-4' : !!$vuetify.breakpoint.mdAndUp
              }"
            >
              <v-switch
                v-model="doNotTruncateValues"
                :label="$t('host.showFullContent') | capitalize"
                hide-details
              />
            </v-flex>
            <v-flex
              xs12
              md5
            >
              <v-text-field
                v-model="search"
                append-icon="search"
                :label="$t('form.field.search') | capitalize"
                single-line
                hide-details
                clearable
              />
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-divider/>
        <v-data-table
          v-if="logs"
          :headers="headers"
          :items="logs"
          :search="search"
          :custom-filter="useFrontendFilter_expressionSearch"
          :rows-per-page-items="rowsPerPage"
          :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
          item-key="createTimestamp"
          disable-initial-sort
        >
          <template #items="props">
            <tr
              class="pointer"
              @click="props.expanded = !props.expanded"
            >
              <v-tooltip bottom>
                <span>
                  {{ props.item.status }}
                </span>
                <td
                  slot="activator"
                  :class="{
                    'd-flex': true,
                    'message-type--col': true,
                    'px-0': true,
                    'success': props.item.status.toLowerCase() === 'completed',
                    'error': props.item.status.toLowerCase() === 'failed',
                    'lighten-1': props.item.status.toLowerCase() === 'failed',
                    'blue-grey darken-1': ['completed', 'failed'].indexOf(props.item.status.toLowerCase()) === -1,
                    'white--text': true,
                  }"
                >
                  <template v-if="props.item.status.toLowerCase() === 'failed'">
                    <v-icon color="white">
                      error
                    </v-icon>
                  </template>
                  <template v-else-if="props.item.status.toLowerCase() === 'completed'">
                    <v-icon color="white">
                      check_circle
                    </v-icon>
                  </template>
                  <template v-else-if="props.item.status.toLowerCase() === 'processing'">
                    <v-icon color="white">
                      autorenew
                    </v-icon>
                  </template>
                  <template v-else>
                    <v-icon color="white">
                      remove_circle
                    </v-icon>
                  </template>
                </td>
              </v-tooltip>
              <td
                :class="{
                  'cell--truncate' : !doNotTruncateValues
                }"
                class="font-weight-medium pr-2"
              >
                <v-tooltip bottom>
                  <span
                    slot="activator"
                    class="pointer"
                  >
                    {{ props.item.sendto }}
                  </span>
                  <span>
                    {{ props.item.sendto }}
                  </span>
                </v-tooltip>
              </td>

              <td>
                <v-chip
                  color="grey darken-1"
                  class="white--text text-uppercase"
                  small
                >
                  {{ props.item.messagetype }}
                </v-chip>
              </td>
              <td class="text-xs-right">
                {{ props.item.attempts }}
              </td>
              <td class="text-xs-right pl-0">
                {{ formattedDateTime(props.item.createTimestamp) }}
              </td>
              <td class="px-0">
                <v-btn
                  icon
                  class="mx-0"
                  :disabled="!props.item.text && !hasStatusCode(props.item)"
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
          <template #expand="props">
            <v-card
              color="grey lighten-3"
              flat
              class="log-detail"
            >
              <div v-if="!!hasStatusCode(props.item)">
                <v-card-text>
                  <v-layout
                    row
                    wrap
                    align-center
                  >
                    <span class="body-1 font-weight-medium">
                      {{ $tc('recipients.httpStatusCodeReceived') | capitalize }}:
                    </span>
                    <v-chip
                      color="grey darken-1"
                      class="white--text"
                      small
                    >
                      {{ props.item.log.code }}
                    </v-chip>
                  </v-layout>
                </v-card-text>
              </div>
              <div v-if="!!props.item.log.body || !!props.item.text">
                <template v-if="!!props.item.log.body">
                  <v-card-title class="body-1 font-weight-medium pb-0">
                    {{ $tc('recipients.response') | capitalize }}
                  </v-card-title>
                  <v-card-text>
                    <pre class="text-word-wrap">{{ isJSON(props.item.log.body) ? toFormattedJSON(props.item.log.body) : props.item.log.body }}</pre>
                  </v-card-text>
                </template>
                <template v-if="!!props.item.text">
                  <v-card-title class="body-1 font-weight-medium pb-0">
                    {{ $tc('recipients.textSent') | capitalize }}
                  </v-card-title>
                  <v-card-text>
                    <pre class="text-word-wrap">{{ isJSON(props.item.text) ? toFormattedJSON(props.item.text) : props.item.text }}</pre>
                  </v-card-text>
                </template>
              </div>
            </v-card>
          </template>
          <template #no-data>
            <TableNoData :is-loading="$fetchState.pending"/>
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
        <AppWait :wait="$fetchState.pending" height="100%"/>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import AppWait from '@/components/App/AppWait';
  import RangeDatePicker from '@/components/App/DatePicker/RangeDatePicker';

  import AppMixin from '@/mixins/app';
  import useDateTime from '@/mixins/useDateTime';
  import useFrontendFilter from '@/mixins/useFrontendFilter';
  import TableNoData from '@/components/App/TableNoData';

  export default {
    components: {
      TableNoData,
      AppWait,
      RangeDatePicker,
    },
    mixins: [
      AppMixin,
      useFrontendFilter,
      useDateTime
    ],
    data() {
      return {
        logs: [],
        search: '',
        headers: [
          {
            text: this.$options.filters.capitalize(
              this.$tc('phrase.status'),
            ),
            align: 'left',
            value: 'status',
            width: '1%',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.send_to')),
            align: 'left',
            value: 'sendto',
            width: '50%',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.type')),
            align: 'left',
            value: 'messagetype',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.attempts')),
            align: 'right',
            value: 'attempts',
            width: '1%',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.date')),
            align: 'right',
            value: 'createTimestamp',
            width: '30%',
          },
          {
            text: null, align: 'right', sortable: false,
          },
        ],
        rowsPerPage: [10, 25, 50, { text: this.$t('phrase.all'), value: -1 }],
        doNotTruncateValues: false,
        timestamps: {
          from: null,
          to: null,
        }
      }
    },
    created() {
      this.setDefaultTimestamps();
    },
    async fetch() {
      await this.getLogs();
    },
    computed: {
      ...mapState('recipients', {
        dialog: 'logsDialog',
      }),
      ...mapState('recipients', [
        'selectedRecipient'
      ]),
      timezone() {
        return this.$auth.team.timezone;
      },
    },
    methods: {
      ...mapMutations('recipients', [
        'toggleLogsDialog'
      ]),
      async getLogs() {
        this.$wait.start(this.$WAIT_FOR.RECIPIENT.LOGS);
        try {
          const { data } = await this.$axios.get(`/recipients/${this.selectedRecipient.id}/logs?filter[from]=${this.timestamps.from}&filter[to]=${this.timestamps.to}`);
          this.logs = data.data;
        } catch (e) {
          console.log(e)
        } finally {
          this.$wait.end(this.$WAIT_FOR.RECIPIENT.LOGS);
        }
      },
      onCancel() {
        this.reset();
        this.toggleLogsDialog(false);
      },
      onDatePickerInput(timestampFrom, timestampTo) {
        this.timestamps.from = timestampFrom;
        this.timestamps.to = timestampTo;
        this.$fetch();
      },
      setDefaultTimestamps() {
        this.timestamps.from = this.timestampNowSubtract(1, 'hour');
        this.timestamps.to = this.timestampNow();
      },
      toFormattedJSON(str) {
        return JSON.stringify(JSON.parse(str), null, 4)
      },
      isJSON(str) {
        try {
          JSON.parse(str);
        } catch (e) {
          return false;
        }

        return true;
      },
      hasStatusCode({log}) {
        return !!log?.code;
      },
      reset() {
        this.logs = [];
        this.search = '';
        this.doNotTruncateValues = false;
      }
    },
  };
</script>
<style lang="stylus" scoped>
.log-detail > div:not(first-child)
  border-top: 1px solid rgba(0,0,0,0.2)
.message-type--col
  box-shadow: inset -2px 0 0 0 rgba(0, 0, 0, 0.3)
</style>
