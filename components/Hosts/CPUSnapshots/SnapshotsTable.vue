<template>
  <div class="position-relative">
    <SnapshotSlider
      v-if="snapshots && selectedSnapshot"
      v-model="snapshotSlider"
      :selected-snapshot="selectedSnapshot"
      :snapshots="snapshots"
    />
    <v-divider/>
    <v-data-table
      v-if="selectedSnapshot"
      :headers="headers"
      :hide-actions="true"
      :items="selectedSnapshot.top"
      class="qa-utilis-tbl"
      disable-initial-sort
      item-key="id"
    >
      <template #items="{item}">
        <tr>
          <td>
            <v-tooltip
              :max-width="250"
              :open-delay="50"
              bottom
              dark
            >
              <div
                v-if="item.name"
                slot="activator"
              >
                {{ item.name | truncate(20) }}
              </div>
              {{ item.name }}
            </v-tooltip>
          </td>
          <td>
            <v-tooltip
              :max-width="250"
              :open-delay="50"
              bottom
              dark
            >
              <div
                v-if="item.command"
                slot="activator"
              >
                {{ item.command | truncate(20) }}
              </div>
              {{ item.command }}
            </v-tooltip>
          </td>
          <td>{{ +(item.load1_percent.toFixed(2)) }}%</td>
          <td>{{ +(item.load5_percent.toFixed(2)) }}%</td>
          <td>{{ +(item.load15_percent.toFixed(2)) }}%</td>
          <td>
            <v-tooltip
              :max-width="250"
              :open-delay="50"
              bottom
              dark
            >
              <div
                v-if="item['pid.list']"
                slot="activator"
              >
                {{ pidList(item['pid.list']) | truncate(20) }}
              </div>
              {{ pidList(item['pid.list']) }}
            </v-tooltip>
          </td>
          <td>{{ item.parent_pid }}</td>
        </tr>
      </template>

      <template #no-data>
        <div class="text-xs-center">
          {{ $t('message.error.noData') }}
        </div>
      </template>
    </v-data-table>
    <AppWait
      :wait="$fetchState.pending"
      height="100%"
    />
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import SnapshotSlider from '@/components/Hosts/CPUSnapshots/SnapshotSlider';
  import AppWait from '@/components/App/AppWait';

  export default {
    components: {
      AppWait,
      SnapshotSlider,
    },
    async fetch() {
      if (! this.cpuUtilizationSnapshots[this.Host.id]) {
        await this.getHostCpuUtilizationSnapshots({ Host: this.Host });
      }
      if (this.snapshots.length > 0) {
        this.selectedSnapshot = this.snapshots[0];
        this.$emit('on-fetch', { summary: this.snapshotsSummary(this.snapshots) });
      }
    },
    data() {
      return {
        selectedSnapshot: null,
        snapshotSlider: 0,
        headers: [
          {
            text: this.$options.filters.capitalize(this.$t('phrase.processName')),
            sortable: false,
            width: 150,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.command')),
            sortable: false,
            width: 150,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.loadAvg1')),
            sortable: false,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.loadAvg5')),
            sortable: false,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.loadAvg15')),
            sortable: false,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.pids')),
            sortable: false,
            width: 150,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.parentPID')),
            sortable: false,
          },
        ],
      };
    },
    computed: {
      ...mapState('hosts', ['Host', 'cpuUtilizationSnapshots']),
      snapshots() {
        if (! this.Host) return [];
        return this.cpuUtilizationSnapshots[this.Host.id] || [];
      },
      numberOfSnapshots() {
        return this.snapshots.length;
      },
    },
    watch: {
      snapshotSlider(value) {
        this.updateSnapshotTable(value);
      },
      snapshots() {
        this.updateSnapshotTable(0);
      },
    },
    methods: {
      ...mapActions('hosts', ['getHostCpuUtilizationSnapshots']),
      snapshotsSummary(snapshots) {
        const count = this.numberOfSnapshots;
        const dateRange = `${snapshots[0].dates.createdAt.local.formatted} - ${snapshots[count - 1].dates.createdAt.local.formatted}`;
        return `${count} ${this.$tc('phrase.snapshot', count)}, ${dateRange}`;
      },
      updateSnapshotTable(value) {
        this.selectedSnapshot = this.snapshots[value];
      },
      pidList(PIDs) {
        if (! PIDs) return '';

        return PIDs.reduce((str, pid) => `${str}, ${pid}`, '').replace(/^,\s*/, '');
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .codeDisplay
    padding: 6px
    white-space: normal;
    overflow: auto

    kbd
      width: 100%
</style>
