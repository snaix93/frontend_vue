<template>
  <v-card
    class="grey lighten-3"
    flat
  >
    <v-card-text class="event-list">
      <v-btn
        class="clear-event caption qa-clear-event"
        color="grey darken-4"
        flat
        small
        @click="deleteWithConfirmation"
      >
        <v-icon left>
          delete
        </v-icon>
        {{ $t('button.clearEvent') | capitalize }}
      </v-btn>
      <v-list class="grey lighten-3 pa-0">
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <v-icon color="grey darken-2">
              whatshot
            </v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title>
              {{ $tc('phrase.severity', 1) | capitalize }}
            </v-list-tile-sub-title>
            <v-list-tile-title>
              <div class="text-truncate">
                <span
                  v-if="['error', 'alert'].includes(Event.action) ||
                    ['error', 'alert'].includes(Event.meta.severity)"
                  class="error--text"
                >
                  {{ $t('phrase.alert') | capitalize }}
                </span>
                <span
                  v-else-if="Event.action === 'warn' || Event.meta.severity === 'warn'"
                  class="warning--text"
                >
                  {{ $t('phrase.warning') | capitalize }}
                </span>
                <span
                  v-else
                  class="warning--text"
                >
                  {{ Event.meta.severity || '-' }}
                </span>
              </div>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <v-icon color="grey darken-2">
              alarm_add
            </v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title>
              {{ $t('checks.eventCreated') | capitalize }}
            </v-list-tile-sub-title>
            <v-list-tile-title>
              <div class="text-truncate">
                {{ Event.dates.createdAt.local.formatted }}
              </div>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-if="Event.dates.lastCheckedAt"
          avatar
        >
          <v-list-tile-avatar>
            <v-icon color="grey darken-2">
              alarm_on
            </v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title>
              {{ $t('checks.lastCheck') | capitalize }}
            </v-list-tile-sub-title>
            <v-list-tile-title>
              <div class="text-truncate">
                {{ Event.dates.lastCheckedAt.local.formatted }}
              </div>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-if="Event.meta.check && Event.meta.check.name"
          avatar
        >
          <v-list-tile-avatar>
            <v-icon color="grey darken-2">
              description
            </v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title>
              {{ $t('dashboard.issue') | capitalize }}
            </v-list-tile-sub-title>
            <v-list-tile-title>
              <div
                class="text-truncate"
              >
                <template v-if="Event.action === 'warn'">
                  {{
                    $t('dashboard.theRuleHasTriggeredAWarning', { text: Event.meta.name })
                      | capitalize
                  }}
                </template>
                <template v-else>
                  {{
                    $t('dashboard.theRuleHasTriggeredAnAlert', { text: Event.meta.name })
                      | capitalize
                  }}
                </template>
              </div>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          avatar
        >
          <v-list-tile-avatar>
            <v-icon color="grey darken-2">
              av_timer
            </v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title>
              {{ $t('phrase.duration') | capitalize }}
            </v-list-tile-sub-title>
            <v-list-tile-title>
              <div class="text-truncate">
                {{ $t('phrase.ago', { time: timeAgoDetailed(Event.dates.createdAt.timestamp) }) }}
              </div>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-if="includeHost &&
            Event.meta.affectedHost &&
            Event.meta.affectedHost.name"
          avatar
        >
          <v-list-tile-avatar>
            <v-icon color="grey darken-2">
              storage
            </v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title>
              {{ $tc('phrase.host', 1) | capitalize }}
            </v-list-tile-sub-title>
            <v-list-tile-title>
              <div class="text-truncate">
                <nuxt-link
                  v-if="$auth.user.isNotReadOnly()"
                  :to="`/hosts/${Event.meta.affectedHost.uuid}`"
                >
                  {{ Event.meta.affectedHost.name }}
                </nuxt-link>
                <span v-else>
                  {{ Event.meta.affectedHost.name }}
                </span>
              </div>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-if="Event.meta.affectedHost && Event.meta.affectedHost.location"
          avatar
        >
          <v-list-tile-avatar>
            <v-icon color="grey darken-2">
              location_on
            </v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title>
              {{ $t('phrase.location') | capitalize }}
            </v-list-tile-sub-title>
            <v-list-tile-title>
              <div class="text-truncate">
                {{ Event.meta.affectedHost.location }}
              </div>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-if="!!Event.meta.check &&
            !!Event.meta.check.lastValue
          "
          avatar
        >
          <v-list-tile-avatar>
            <v-icon color="grey darken-2">
              replay
            </v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title>
              {{ $t('dashboard.lastValue') | capitalize }}
              <template v-if="Event.meta.footnote">
                {{ Event.meta.footnote | capitalize }}
              </template>
            </v-list-tile-sub-title>
            <v-list-tile-title>
              <div
                class="text-truncate"
              >
                <span
                  v-if="Event.meta.check.lastValueTextTemplate"
                  v-html="
                    event_formatLastValue(
                      Event.meta.check.lastValueTextTemplate,
                      Event.meta.check.lastValue
                    )
                  "
                />
                <span v-else>
                  {{ Event.meta.check.lastValue }}
                </span>
              </div>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapMutations } from 'vuex';
  import useDateTime from '@/mixins/useDateTime';
  import eventMixins from '@/mixins/event';
  import userMixins from '@/mixins/user';
  import Event from '@/models/Event';

  export default {
    mixins: [
      useDateTime,
      eventMixins,
      userMixins,
    ],
    props: {
      Event: {
        type: Event,
        required: true,
      },
      includeHost: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    methods: {
      ...mapMutations('events', ['toggleDeleteDialog', 'setSelectedEvent']),
      deleteWithConfirmation() {
        this.setSelectedEvent(this.Event);
        this.toggleDeleteDialog();
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .v-list__tile__title
    height: 18px

  .v-list__tile__sub-title
    margin-bottom: 5px

  .event-list
    position: relative;

  .clear-event
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 1000;
</style>
