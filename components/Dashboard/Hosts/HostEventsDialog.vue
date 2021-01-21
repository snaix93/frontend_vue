<template>
  <DashboardAbstractEventsDialog
    :$fetch-state="$fetchState"
    :alert-history="alertHistory"
    :events="events"
    :key="`${Host.id}-DashboardAbstractEventsDialog`"
  >
    <template #title>
      <span>{{ Host.name }}</span>
      <span class="subheading grey--text ml-4">
        {{ Host.connect }}
      </span>
    </template>
  </DashboardAbstractEventsDialog>
</template>

<script>
  import { mapActions, mapState, mapMutations } from 'vuex';
  import DashboardAbstractEventsDialog from '@/components/Dashboard/DashboardAbstractEventsDialog';

  export default {
    components: {
      DashboardAbstractEventsDialog,
    },
    data() {
      return {
        alertHistory: [],
      };
    },
    async fetch() {
      await this.getEvents({
        Event: this.Host.events()
      });
    },
    created() {
      this.getAlertHistory();
    },
    beforeDestroy() {
      this.setEvents([]);
      this.alertHistory = [];
    },
    computed: {
      ...mapState('dashboard', {
        Host: 'Host',
      }),
      ...mapState('events', ['events']),
    },
    methods: {
      ...mapActions('events', ['getEvents']),
      ...mapMutations('events', ['setEvents']),
      async getAlertHistory() {
        this.$wait.start(this.$WAIT_FOR.DASHBOARD.ALERT_HISTORY);
        try {
          this.alertHistory = await this.Host.getAlertHistory() || [];
        } catch (e) {
          this.alertHistory = [];
        } finally {
          this.$wait.end(this.$WAIT_FOR.DASHBOARD.ALERT_HISTORY);
        }
      },
    },
  };
</script>
