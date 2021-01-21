<template>
  <v-dialog
    scrollable
    persistent
    :value="dialog"
    max-width="600px"
  >
    <v-card>
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ hyperVMetric.name }}
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
      <v-card-text>
        <v-list class="pa-0">
          <v-subheader class="text-uppercase">
            {{ $t('host.hyperVMetrics.details') }}
          </v-subheader>
          <v-layout
            row
            wrap
          >
            <v-flex
              v-if="showField(hyperVMetric.guid)"
              xs12
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title>
                    <span>{{ hyperVMetric.guid }}</span>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.guid') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>

            <v-flex
              v-if="showField(hyperVMetric.assigned_memory_B)"
              xs12
              md6
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title>
                    <span>{{
                      filesize(hyperVMetric.assigned_memory_B)
                    }}</span>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.assignedMemory') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>

            <v-flex
              v-if="showField(hyperVMetric.cpu_wait_time_per_dispatch_ns)"
              xs12
              md6
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title>
                    <span>{{ hyperVMetric.cpu_wait_time_per_dispatch_ns }} ns</span>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.CPUWaitTimePerDispatch') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>

            <v-flex
              v-if="showField(hyperVMetric.creation_time)"
              xs12
              md6
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title>
                    <span>{{
                      formattedDateTime(hyperVMetric.creation_time)
                    }}</span>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.creationTime') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>

            <v-flex
              v-if="showField(hyperVMetric.enabled_state)"
              xs12
              md6
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title style="height:28px">
                    <v-chip
                      :color="stateColor(hyperVMetric.enabled_state)"
                      text-color="white"
                      class="health-state--chip ma-0"
                      small
                    >
                      {{ hyperVMetric.enabled_state.toUpperCase() }}
                    </v-chip>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.enabledState') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>

            <v-flex
              v-if="showField(hyperVMetric.guest_operating_system)"
              xs12
              md6
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title>
                    <span>{{ hyperVMetric.guest_operating_system }}</span>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.guestOperatingSystem') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>

            <v-flex
              v-if="showField(hyperVMetric.health_state)"
              xs12
              md6
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title style="height:28px">
                    <v-chip
                      :color="healthStateColor(hyperVMetric.health_state)"
                      text-color="white"
                      class="health-state--chip ma-0"
                      small
                    >
                      {{ hyperVMetric.health_state.toUpperCase() }}
                    </v-chip>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.healthState') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>

            <v-flex
              v-if="showField(hyperVMetric.heartbeat)"
              xs12
              md6
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title style="height:28px">
                    <v-chip
                      :color="heartBeatColor(hyperVMetric.heartbeat)"
                      text-color="white"
                      class="hearbeat--chip ma-0"
                      small
                    >
                      {{ hyperVMetric.heartbeat.toUpperCase() }}
                    </v-chip>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.heartbeat') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>

            <v-flex
              v-if="showField(hyperVMetric.number_of_processors)"
              xs12
              md6
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title>
                    <span>{{ hyperVMetric.number_of_processors }}</span>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.numberOfProcessors') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>

            <v-flex
              v-if="showField(hyperVMetric.processor_load_percent)"
              xs12
              md6
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title>
                    <span>{{ hyperVMetric.processor_load_percent }}</span>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.processorLoad') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>

            <v-flex
              xs12
              md6
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title>
                    <span>{{ hyperVMetric.uptime_s }} s</span>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.uptime') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>

            <v-flex
              xs12
              md6
            >
              <v-list-tile class="mb-3">
                <v-list-tile-content>
                  <v-list-tile-title>
                    <span>{{ hyperVMetric.version }}</span>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $t('phrase.version') | capitalize }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>
          </v-layout>
        </v-list>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          color="primary"
          flat
          @click="onCancel"
        >
          {{ $t('button.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import useDateTime from '@/mixins/useDateTime';
  import hyperVMetricsMixins from '@/mixins/hyperVMetrics';

  export default {
    mixins: [useDateTime, hyperVMetricsMixins],
    props: {
      hyperVMetric: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {};
    },
    computed: {
      ...mapState('hosts', {
        dialog: 'hyperVMetricDialog'
      }),
    },
    methods: {
      ...mapMutations('hosts', ['toggleHyperVMetricDialog']),
      showField(field) {
        return field !== undefined && field !== null && field !== '';
      },
      onCancel() {
        this.toggleHyperVMetricDialog();
      },
    },
  };
</script>
