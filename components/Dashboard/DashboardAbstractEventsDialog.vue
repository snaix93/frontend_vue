<template>
  <v-dialog
    :value="dialog"
    class="position-relative"
    lazy
    max-width="1200px"
    persistent
  >
    <v-card>
      <v-card-title class="grey lighten-3">
        <span class="title mr-4">
          {{ $t('dashboard.events') | capitalize }}
        </span>
        <span class="title mr-4">
          <slot name="title"/>
        </span>
        <v-spacer/>
        <v-btn
          bottom
          icon
          left
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-expand-transition>
        <v-card>
          <v-data-table
            :expand="true"
            :headers="headers"
            :items="events"
            class="qa-active-alerts"
            hide-actions
            item-key="id"
          >
            <template #items="props">
              <tr
                class="pointer"
                @click="props.expanded = ! props.expanded"
              >
                <EventSeverityIndicator :Event="props.item"/>
                <td v-if="showHost">
                  <span v-if="props.item.host.name">{{ props.item.host.name }}</span>
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
                  <!--                  <template v-if="$auth.user.isNotReadOnly()">-->
                  <!--                    <v-btn-->
                  <!--                      v-if="props.item.reminders"-->
                  <!--                      :title="$t('button.cancelReminders')"-->
                  <!--                      class="ma-0"-->
                  <!--                      icon-->
                  <!--                      @click.prevent.stop="onCancelRemindersConfirm(props.item)"-->
                  <!--                    >-->
                  <!--                      <v-icon color="error">-->
                  <!--                        notifications_off-->
                  <!--                      </v-icon>-->
                  <!--                    </v-btn>-->
                  <!--                    <v-tooltip-->
                  <!--                      v-else-->
                  <!--                      class="v-tooltip--hint"-->
                  <!--                      top-->
                  <!--                    >-->
                  <!--                      <v-btn-->
                  <!--                        slot="activator"-->
                  <!--                        class="ma-0"-->
                  <!--                        disabled-->
                  <!--                        icon-->
                  <!--                      >-->
                  <!--                        <v-icon color="grey">-->
                  <!--                          notifications_off-->
                  <!--                        </v-icon>-->
                  <!--                      </v-btn>-->
                  <!--                      <span>{{ $t('phrase.reminders') }}<br>{{ $t('phrase.cancelled') }}</span>-->
                  <!--                    </v-tooltip>-->
                  <!--                  </template>-->

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
            <template #no-data>
              <TableNoData :is-loading="$fetchState.pending"/>
            </template>
          </v-data-table>
        </v-card>
      </v-expand-transition>
      <v-expand-transition>
        <v-card class="mt-1">
          <v-card-title class="grey lighten-3">
            <span class="body-2 mr-4">
              {{ $t('dashboard.lastAlerts', { n: 10 }) | capitalize }}
            </span>
          </v-card-title>
          <v-data-table
            :headers="alertsHeader"
            :items="computedAlertHistory"
            class="elevation-1 qa-last-alerts"
            hide-actions
          >
            <template #items="props">
              <td>
                <strong>{{ props.item.triggerName }}</strong>
              </td>
              <td>
                {{
                  (props.item.triggerSeverity
                   ? $t('phrase.' + props.item.triggerSeverity)
                   : '') | capitalize
                }}
              </td>
              <td>
                {{ secondsToTime(parseInt(props.item.duration)) }}
              </td>
              <td>{{ formattedDateTime(props.item.createTimestamp) }}</td>
              <td>
                {{
                  formattedDateTime(
                    parseInt(props.item.createTimestamp) +
                    parseInt(props.item.duration),
                  )
                }}
              </td>
            </template>
            <template #no-data>
              <TableNoData :is-loading="$wait.is($WAIT_FOR.DASHBOARD.ALERT_HISTORY)">
                {{ $t('events.noAlertsAvailable') }}
              </TableNoData>
            </template>
          </v-data-table>
        </v-card>
      </v-expand-transition>
    </v-card>

    <EventDeleteConfirmDialog
      v-if="deleteDialog"
      @on-delete="onDelete"
    />
  </v-dialog>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import EventDeleteConfirmDialog from '@/components/Events/EventDeleteConfirmDialog';
  import EventSeverityIndicator from '@/components/Events/EventSeverityIndicator';
  import SkeletonLoader from '@/components/App/SkeletonLoader';
  import EventDetail from '@/components/Dashboard/Hosts/EventDetail';
  import EventIssueBadge from '@/components/Events/EventIssueBadge';
  import EventComments from '@/components/Events/EventComments';
  import useDateTime from '@/mixins/useDateTime';
  import eventMixins from '@/mixins/event';
  import userMixins from '@/mixins/user';
  import Host from '@/models/Host';
  import TableNoData from '@/components/App/TableNoData';

  export default {
    components: {
      EventDeleteConfirmDialog,
      EventSeverityIndicator,
      EventIssueBadge,
      SkeletonLoader,
      EventComments,
      EventDetail,
      TableNoData,
    },
    mixins: [
      useDateTime,
      eventMixins,
      userMixins,
    ],
    props: {
      $fetchState: {},
      showHost: {
        type: Boolean,
        required: false,
        default: false
      },
      events: {
        type: Array,
        required: true,
      },
      alertHistory: {
        type: Array,
        required: false,
        default: () => []
      },
    },
    data() {
      return {
        alertsHeader: [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.message')),
            sortable: false,
            value: 'triggerName',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.severity')),
            sortable: false,
            value: 'triggerSeverity',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.duration')),
            sortable: false,
            value: 'duration',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.alert')),
            sortable: false,
            value: 'createTimestamp',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.recovery')),
            sortable: false,
            value: null,
          },
        ],
      };
    },
    computed: {
      ...mapState('events', ['deleteDialog']),
      ...mapState('dashboard', {
        dialog: 'eventsDialog',
        Host: 'Host',
      }),
      computedAlertHistory() {
        return this.alertHistory;
      },
      headers() {
        const hostNameValue = 'host name';
        let headers = [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.type')),
            sortable: false,
            value: 'type',
            width: '80px',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('dashboard.host')),
            sortable: false,
            value: hostNameValue,
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
            sortable: false,
            value: null,
          },
          {
            text: null,
            sortable: false,
            value: null,
            width: '1%',
          },
        ];

        if (! this.showHost) {
          headers = headers.filter(header => header.value !== hostNameValue);
        }

        return headers;
      }
    },
    methods: {
      ...mapMutations('dashboard', ['toggleEventsDialog']),
      redirectToHostLatestData(Event) {
        this.$router.push(new Host({ ...Event.host }).latestDataPath);
        this.onCancel();
      },
      onCancelRemindersConfirm(Event) {
        // TODO
        console.log('onCancelRemindersConfirm');
        console.log(Event, `Event`);
      },
      onCancel() {
        this.toggleEventsDialog();
      },
      onDelete({ Event, success = true }) {
        const issue = Event.issueDescription;
        if (success) {
          this.$bus.$emit('dashboard:refresh');
          this.$flash.success(this.$t('message.success.clearEvent', { issue }));
        } else {
          this.$flash.error(this.$t('message.error.clearEvent', { issue }));
        }
      },
    },
  };
</script>
