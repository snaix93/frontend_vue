<template>
  <v-card>
    <v-card-text>
      <v-layout column>
        <v-flex
          xs12
          pt-3
          pb-0
        >
          <v-layout
            align-center
            justify-space-between
            class="caption font-italic"
          >
            <v-divider
              class="mr-2"
              vertical
            />
            <v-flex shrink>
              {{ $t('phrase.latest') | capitalize }} - {{ firstSnapshotDate }}
            </v-flex>
            <v-divider/>
            <v-flex shrink>
              {{ lastSnapshotDate }} - {{ $t('phrase.oldest') | capitalize }}
            </v-flex>
            <v-divider
              class="ml-2"
              vertical
            />
          </v-layout>
        </v-flex>
        <v-flex
          xs12
          pt-0
        >
          <v-slider
            v-model="snapshotSlider"
            :always-dirty="true"
            :max="numberOfSnapshots"
            tick-size="4"
            thumb-size="50"
            ticks="always"
            persistent-hint
          />
        </v-flex>
        <v-flex xs12>
          <v-layout
            align-center
            justify-space-between
            class="caption"
          >
            <v-flex>
              <div class="body-1">
                {{ formatTimestamp(selectedSnapshot.timestamp) }}
              </div>
              <div>{{ renderSettings(selectedSnapshot.settings) }}</div>
            </v-flex>
            <v-flex shrink>
              <div class="mt-3 mb-0">
                <v-icon
                  small
                  color="primary"
                >
                  help
                </v-icon>
                <a
                  href="https://docs.cloudradar.io/reviewing-monitoring-data/cpu-utilisation-snapshots"
                  target="_blank"
                >{{ $t('host.cpuSnapshots.learnMore') | capitalize }}</a>
              </div>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
  import DateTimeMixin from '@/mixins/useDateTime';

  export default {
    mixins: [DateTimeMixin],
    props: {
      snapshots: {
        type: Array,
        required: true,
      },
      selectedSnapshot: {
        type: Object,
        required: true,
      },
      value: {},
    },
    data() {
      return {
        snapshotSlider: this.value,
      };
    },
    computed: {
      firstSnapshotDate() {
        return this.formatTimestamp(this.snapshots[0].timestamp);
      },
      lastSnapshotDate() {
        return this.formatTimestamp(this.snapshots[this.numberOfSnapshots].timestamp);
      },
      numberOfSnapshots() {
        return this.snapshots.length - 1;
      }
    },
    watch: {
      value() {
        this.snapshotSlider = this.value;
      },
      snapshotSlider() {
        this.$emit('input', this.snapshotSlider);
      },
    },
    methods: {
      formatTimestamp(timestamp) {
        return `${this.formattedDateTime(timestamp, 'HH:mm:ss')} ${this.formattedDate(timestamp)}`;
      },
      renderSettings(settings) {
        let settingFunction;
        // https://docs.cloudradar.io/reviewing-monitoring-data/cpu-utilisation-snapshots
        switch (settings.function) {
          case 'lt':
            settingFunction = this.$t('phrase.lessThan');
            break;
          case 'lte':
            settingFunction = this.$t('phrase.lessThanOrEq');
            break;
          case 'gt':
            settingFunction = this.$t('phrase.greaterThan');
            break;
          case 'gte':
            settingFunction = this.$t('phrase.greaterThanOrEq');
            break;
        }
        return `CPU ${settings.metric.toUpperCase()} (${settings.gathering_mode}) has been ${settingFunction} ${settings.threshold}% - reporting top ${settings.report_processes} processes`;
      },
    },
  };
</script>
