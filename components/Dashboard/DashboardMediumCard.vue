<template>
  <div data-qa="dashboard:medium-card">
    <v-hover>
      <template #default="{ hover }">
        <v-card :class="`elevation-${hover ? 4 : 1}`">
          <v-card-title class="pa-2 grey lighten-3">
            <v-layout align-center row>
              <slot name="title"/>
            </v-layout>
          </v-card-title>
          <v-divider/>
          <v-card-text class="pt-2 pb-1">
            <v-layout align-center wrap>
              <v-flex shrink>
                <v-layout
                  v-for="(metricRow, key, index) in metrics"
                  :key="index"
                  row
                  style="min-height: 44px"
                >
                  <template v-for="metric in metricRow">
                    <v-flex
                      :class="metric.qaRootClass"
                      class="d-flex align-end pr-3"
                      shrink
                    >
                      <div class="d-inline grey--text text--darken-2">
                        <v-tooltip
                          bottom
                          max-width="200"
                        >
                          <div slot="activator">
                            <span class="headline font-weight-medium qa-value">{{ metric.value }}</span>
                            <span class="subheading qa-metric">{{ metric.metric | capitalize }}</span>
                          </div>
                          {{ metric.text }}
                        </v-tooltip>
                      </div>
                    </v-flex>
                  </template>
                </v-layout>
              </v-flex>
              <slot name="charts"/>
            </v-layout>
          </v-card-text>

          <v-divider/>

          <v-card-actions class="py-1">
            <v-layout
              align-center justify-space-between
              row
              wrap
            >
              <v-flex px-0>
                <slot name="badges"/>
              </v-flex>
              <v-flex
                class="text-xs-right"
                shrink
              >
                <slot name="buttons"/>
              </v-flex>
            </v-layout>
          </v-card-actions>
        </v-card>
      </template>
    </v-hover>
  </div>
</template>

<script>
  import AppWait from '@/components/App/AppWait';

  export default {
    components: { AppWait },
    props: {
      metrics: {
        type: Array,
        required: true,
      }
    },
  };
</script>
