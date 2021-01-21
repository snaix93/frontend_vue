<template>
  <DashboardAbstractEventsDialog
    :$fetch-state="$fetchState"
    :events="events"
    :show-host="true"
    :key="`${Host.id}-DashboardAbstractEventsDialog`"
  >
    <template #title>
      <span class="subheading grey--text ml-4">
        <template v-if="isAggregatingBySubUnit">
          "{{ AggregatedHostData.groupedEntity.shortId }}"
        </template>
        <template v-else>
          "{{ AggregatedHostData.groupedEntity }}"
        </template>
      </span>
    </template>
  </DashboardAbstractEventsDialog>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import DashboardAbstractEventsDialog from '@/components/Dashboard/DashboardAbstractEventsDialog';
  import AggregatedHostData from '@/models/AggregatedHostData';

  export default {
    components: {
      DashboardAbstractEventsDialog,
    },
    async fetch() {
      await this.getEvents({
        Event: AggregatedHostData
          .filter({
            ...AggregatedHostData.activeFilters,
            aggregateEntity: this.isAggregatingBySubUnit
                             ? this.AggregatedHostData.groupedEntity.id
                             : this.AggregatedHostData.groupedEntity
          })
          .setAggregatedType(this.AggregatedHostData.groupedBy)
          .events(),
      });
    },
    computed: {
      ...mapState('dashboard', {
        AggregatedHostData: 'AggregatedHostData',
        Host: 'Host',
      }),
      ...mapState('events', ['events']),
      isAggregatingBySubUnit() {
        return this.AggregatedHostData.groupedBy === 'sub-unit';
      }
    },
    beforeDestroy() {
      this.setEvents([]);
    },
    methods: {
      ...mapActions('events', ['getEvents']),
      ...mapMutations('events', ['setEvents']),
    },
  };
</script>
