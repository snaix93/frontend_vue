<template>
  <v-flex data-cy="eventsList">
    <v-card>
      <v-card-text class="pt-1">
        <v-layout
          align-end justify-end pb-3
          wrap
        >
          <SearchBox
            v-model="filters.search"
            :search-by="['host name', 'connect', 'description/event meta', 'check key']"
          />
        </v-layout>
      </v-card-text>
      <v-divider/>
      <div class="position-relative">
        <v-data-table
          :expand="true"
          :headers="headers"
          :items="events"
          :pagination.sync="pagination"
          :rows-per-page-items="rowsPerPage"
          :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
          :total-items="totalCount"
          class="elevation-1 qa-active-alerts position-relative"
          item-key="id"
        >
          <template #items="props">
            <tr
              class="pointer"
              @click="props.expanded = ! props.expanded"
            >
              <EventSeverityIndicator :Event="props.item"/>
              <td>
                <span v-if="props.item.host">{{ props.item.host.name }}</span>
                <span v-else>-</span>
              </td>
              <td class="pr-0">
                <EventIssueBadge :Event="props.item"/>
              </td>
              <td style="max-width:230px">
                <v-tooltip
                  v-if="props.item.meta && props.item.meta.description"
                  :disabled="
                      !props.item.meta ||
                        !props.item.meta.description ||
                        props.item.meta.description.length < event_descriptionTruncateLength
                    "
                  left
                >
                  <span>
                    {{ props.item.meta.description }}
                  </span>
                  <div
                    slot="activator"
                    class="text-truncate"
                  >
                    {{ props.item.meta.description | truncate(event_descriptionTruncateLength) }}
                  </div>
                </v-tooltip>
                <template v-else>
                  -
                </template>
              </td>
              <td class="grey--text darken-2" style="max-width:220px">
                <v-tooltip
                  v-if="
                      props.item.meta &&
                        props.item.meta.check &&
                        props.item.meta.check.lastValue
                    "
                  :disabled="!props.item.meta.footnote"
                  bottom
                  class="d-block"
                >
                  <span>{{ props.item.meta.footnote }}</span>
                  <div
                    slot="activator"
                    class="text-truncate"
                  >
                    <span
                      v-if="props.item.meta.check.lastValueTextTemplate"
                      v-html="
                          event_formatLastValue(
                            props.item.meta.check.lastValueTextTemplate,
                            props.item.meta.check.lastValue
                          )
                        "
                    />
                    <span v-else>
                      {{ props.item.meta.check.lastValue }}
                    </span>
                  </div>
                </v-tooltip>
                <template v-else>
                  -
                </template>
              </td>
              <td class="pr-0">
                {{ props.item.dates.createdAt.local.formatted }}
              </td>
              <td class="px-0 text-no-wrap text-xs-right">
                <template v-if="$auth.user.isNotReadOnly()">
                  <v-btn
                    v-if="props.item.reminders"
                    :disabled="$wait.is($WAIT_FOR.EVENT.CONFIRM_CANCEL_REMINDER_ID(props.item.id))"
                    :loading="$wait.is($WAIT_FOR.EVENT.CONFIRM_CANCEL_REMINDER_ID(props.item.id))"
                    :title="$t('button.cancelReminders')"
                    class="ma-0"
                    icon
                    @click.prevent.stop="updateWithConfirmation(props.item)"
                  >
                    <v-icon color="error">
                      notifications_off
                    </v-icon>
                  </v-btn>
                  <v-tooltip
                    v-else
                    class="v-tooltip--hint"
                    top
                  >
                    <v-btn
                      slot="activator"
                      class="ma-0"
                      disabled
                      icon
                    >
                      <v-icon color="grey">
                        notifications_off
                      </v-icon>
                    </v-btn>
                    <span>{{ $t('phrase.reminders') }}<br>{{ $t('phrase.cancelled') }}</span>
                  </v-tooltip>
                </template>

                <v-btn
                  v-if="props.item.host"
                  :title="$t('button.goToLatestData') | capitalize"
                  class="mx-0"
                  icon
                  @click="redirectToHostLatestData(props.item)"
                >
                  <v-icon class="secondary--text">
                    bar_chart
                  </v-icon>
                </v-btn>

                <v-btn
                  color="secondary"
                  flat
                  icon
                >
                  <v-icon small>
                    {{ props.expanded ? 'expand_less' : 'expand_more' }}
                  </v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
          <template #expand="{ item: Event, expanded }">
            <v-divider/>
            <EventDetail :Event="Event"/>
            <v-divider/>
            <EventComments
              v-if="expanded"
              :key="Event.id"
              :Event="Event"
            />
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
        <AppWait
          :hide-message="true"
          :wait="useFilters_initialLoadComplete && $fetchState.pending"
          height="100%"
        />
      </div>

      <EventDeleteConfirmDialog
        v-if="deleteDialog"
        @on-delete="onDelete"
      />
      <EventReminderDeleteConfirmDialog
        v-if="deleteReminderDialog"
        @on-update="onUpdate"
      />
    </v-card>
  </v-flex>
</template>

<script>
  import { mapActions, mapState, mapMutations } from 'vuex';
  import EventReminderDeleteConfirmDialog from '@/components/Events/EventReminderDeleteConfirmDialog';
  import EventDeleteConfirmDialog from '@/components/Events/EventDeleteConfirmDialog';
  import EventSeverityIndicator from '@/components/Events/EventSeverityIndicator';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import EventDetail from '@/components/Dashboard/Hosts/EventDetail';
  import usePersistableFilters from '@/mixins/usePersistableFilters';
  import EventIssueBadge from '@/components/Events/EventIssueBadge';
  import AppConfirmDialog from '@/components/App/AppConfirmDialog';
  import EventComments from '@/components/Events/EventComments';
  import TableNoData from '@/components/App/TableNoData';
  import SearchBox from '@/components/Form/SearchBox';
  import useDateTime from '@/mixins/useDateTime';
  import AppWait from '@/components/App/AppWait';
  import useFilters from '@/mixins/useFilters';
  import eventMixins from '@/mixins/event';
  import Event from '@/models/Event';
  import Host from '@/models/Host';

  export default {
    components: {
      TableNoData,
      EventReminderDeleteConfirmDialog,
      EventDeleteConfirmDialog,
      EventSeverityIndicator,
      AppConfirmDialog,
      EventIssueBadge,
      EventComments,
      EventDetail,
      SearchBox,
      AppWait,
    },
    mixins: [
      useFilterablePagination,
      usePersistableFilters,
      eventMixins,
      useDateTime,
      useFilters,
    ],
    async fetch() {
      await this.filter();
    },
    data() {
      return {
        filters: Event.filters,
        persistableFilterKey: Event.persistableFilterKey,
        headers: [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.type')),
            sortable: false,
            value: 'type',
            width: '80px',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('dashboard.host')),
            sortable: true,
            value: 'host',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('dashboard.issue')),
            sortable: false,
            value: 'issue',
          },
          {
            text: null,
            sortable: false,
            value: null,
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('dashboard.lastValue'),
            ),
            sortable: false,
            value: 'issue',
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('checks.eventCreated'),
            ),
            sortable: true,
            value: 'date-last-checked',
          },
          {
            text: null,
            sortable: false,
            value: null,
            width: '1%',
          },
        ],
      };
    },
    computed: {
      ...mapState('events', [
        'events',
        'selectedEvent',
        'totalCount',
        'deleteDialog',
        'deleteReminderDialog'
      ]),
    },
    methods: {
      ...mapActions('events', ['getEvents']),
      ...mapMutations('events', ['toggleReminderDeleteDialog', 'setSelectedEvent']),
      async filter() {
        await this.getEvents({
          Event: Event.filter(this.filters)
        });
        this.useFilters_initialLoadCompleted();
      },
      updateWithConfirmation(Event) {
        this.setSelectedEvent(Event);
        this.toggleReminderDeleteDialog();
      },
      redirectToHostLatestData(Event) {
        this.$router.push(new Host({ ...Event.host }).latestDataPath);
      },
      onDelete({ Event, success = true }) {
        this.filter();
        this.$emit('on-delete', { Event, success });
      },
      onUpdate({ Event, success = true }) {
        this.filter();
        this.$emit('on-update', { Event, success });
      },
    },
  };
</script>
