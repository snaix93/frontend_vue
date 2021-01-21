<template>
  <div data-qa="dashboard:mini-card">
    <v-hover>
      <template #default="{ hover }">
        <v-card :class="`elevation-${hover ? 4 : 1}`">
          <v-card-title class="py-1 px-2 grey lighten-3">
            <v-layout
              row
              align-center
            >
              <slot name="title"/>
            </v-layout>
          </v-card-title>
          <v-divider/>
          <v-card-text class="px-2 py-1">
            <v-layout
              align-baseline
              style="margin-left: -8px"
            >
              <template v-for="metric in metrics">
                <v-spacer v-if="metric.spacer"/>
                <v-flex
                  v-else
                  shrink
                  ml-2
                >
                  <div :class="metric.qaRootClass">
                    <div class="d-inline caption grey--text text--darken-2">
                      <v-tooltip
                        bottom
                        max-width="200"
                      >
                        <div slot="activator">
                          <span class="body-2 qa-value">{{ metric.value }}</span>
                          <span class="qa-metric">{{ metric.metric | capitalize }}</span>
                        </div>
                        {{ metric.text }}
                      </v-tooltip>
                    </div>
                  </div>
                </v-flex>
              </template>
            </v-layout>
          </v-card-text>

          <v-divider/>

          <v-card-actions class="px-2 py-1">
            <v-layout
              row
              align-center
              justify-space-between
            >
              <v-flex shrink>
                <slot name="badges"/>
              </v-flex>
              <v-flex
                shrink
                class="text-xs-right"
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
  export default {
    props: {
      metrics: {
        type: Array,
        required: true,
      },
    },
  };
</script>
