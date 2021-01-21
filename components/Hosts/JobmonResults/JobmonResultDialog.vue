<template>
  <v-dialog
    :value="dialog"
    max-width="90vw"
    persistent
    scrollable
  >
    <v-card color="grey lighten-3">
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ selectedJobmonResult.jobId }}
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
      <v-card-text
        class="position-relative"
        style="min-height: 100px"
      >
        <template v-if="!$fetchState.pending">
          <v-card
            v-for="(subItem, i) in jobmonResultFullData"
            :key="`${selectedJobmonResult.jobId}--subItem--${i}`"
            :class="{
              'mt-0' : i > 0
            }"
            class="elevation-2"
          >
            <v-card-title>
              <span class="body-2 qa-command">
                <span>
                  {{ $t('phrase.command') | capitalize }}:
                </span>
                <v-chip
                  class="font-monospace white--text"
                  color="primary darken-2 elevation-4 caption"
                  label
                  small
                >
                  {{ subItem.command }}
                </v-chip>
                <v-icon
                  class="mx-1"
                  color="grey"
                  small
                >
                  chevron_right
                </v-icon>
                <v-chip
                  :color="useJobmonResultStatus_statusColor(useJobmonResultStatus_statusFromJob(subItem))"
                  class="elevation-3"
                  small
                  text-color="white"
                >
                  {{ $tc(`phrase.${useJobmonResultStatus_statusFromJob(subItem)}`).toUpperCase() }}
                </v-chip>
              </span>
              <v-spacer/>
              <v-tooltip bottom>
                <v-chip
                  slot="activator"
                  color="grey lighten-3"
                  label
                  outline
                >
                  <span class="grey--text text--darken-3">
                    {{ subItem.dates.jobStarted.local.formatted }}
                  </span>
                  <v-icon
                    class="mx-1"
                    color="grey"
                    small
                  >
                    chevron_right
                  </v-icon>
                  <span class="grey--text text--darken-3">
                    {{ subItem.dates.jobEnded.local.formatted }}
                  </span>
                </v-chip>
                <div>
                  {{ $t('phrase.start') | capitalize }}:
                  <strong>{{ subItem.dates.jobStarted.local.formatted }}</strong>
                </div>
                <div>
                  {{ $t('phrase.end') | capitalize }}:
                  <strong>{{ subItem.dates.jobEnded.local.formatted }}</strong>
                </div>
              </v-tooltip>
              <v-tooltip bottom>
                <v-chip
                  slot="activator"
                  class="grey lighten-4"
                  color="grey lighten-3"
                  label
                  outline
                >
                  <v-icon
                    class="mr-2"
                    color="grey"
                    small
                  >
                    person
                  </v-icon>
                  <span class="grey--text text--darken-3">
                    {{ subItem.jobUser }}
                  </span>
                </v-chip>
                {{ $tc('phrase.user') | capitalize }}
              </v-tooltip>
              <v-tooltip bottom>
                <v-chip
                  slot="activator"
                  color="grey lighten-3"
                  label
                  outline
                >
                  <v-icon
                    class="mr-2"
                    color="grey"
                    small
                  >
                    access_time
                  </v-icon>
                  <span class="grey--text text--darken-3">
                    {{ renderDuration(subItem) }}
                  </span>
                </v-chip>
                {{ $t('phrase.duration') | capitalize }}
              </v-tooltip>
            </v-card-title>
            <v-divider/>
            <v-card-text class="qa-stdout">
              <div class="code primary darken-2 elevation-4">
                <div class="code--header">
                  <v-chip
                    class="code--label primary--text text--lighten-1 ma-0"
                    color="primary darken-4"
                    label
                    small
                  >
                    stdout
                  </v-chip>
                </div>
                <div class="code">
                  <kbd class="pa-3">{{ subItem.stdout }}</kbd>
                </div>
              </div>
            </v-card-text>
            <v-card-text class="qa-stderr">
              <div class="code primary darken-2 elevation-4">
                <div class="code--header">
                  <v-chip
                    class="code--label primary--text text--lighten-1 ma-0"
                    color="primary darken-4"
                    label
                    small
                  >
                    stderr
                  </v-chip>
                </div>
                <div class="code">
                  <kbd class="pa-3">{{ subItem.stderr }}</kbd>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </template>
        <AppWait
          :wait="$fetchState.pending"
          height="100%"
        />
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
  import { mapState, mapMutations, mapActions } from 'vuex';
  import useJobmonResultStatus from '@/mixins/useJobmonResultStatus';
  import AppWait from '@/components/App/AppWait';

  export default {
    components: { AppWait },
    mixins: [
      useJobmonResultStatus,
    ],
    async fetch() {
      await this.getJobmonResultFullDataByJobId({
        hostId: this.Host.id,
        jobId: this.selectedJobmonResult.jobId
      });
    },
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('jobmonResults', {
        dialog: 'jobmonResultDialog',
      }),
      ...mapState('jobmonResults', ['selectedJobmonResult', 'jobmonResultFullData']),
    },
    methods: {
      ...mapMutations('jobmonResults', [
        'toggleJobmonResultDialog',
      ]),
      ...mapActions('jobmonResults', ['getJobmonResultFullDataByJobId']),
      renderDuration({ jobDuration }) {
        const value = jobDuration <= 0 ? '< 1' : jobDuration;
        return `${value}s`;
      },
      onCancel() {
        this.toggleJobmonResultDialog();
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .code
    max-width: 100%;
    overflow: auto;

    kbd
      white-space: pre
</style>
