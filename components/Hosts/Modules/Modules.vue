<template>
  <v-expansion-panel
    expand
  >
    <v-expansion-panel-content
      v-for="(module, i) in items"
      :key="`module-${i}`"
    >
      <template #header>
        <ExpansionPanelHeader
          :title="module.name"
          avatar-icon="widgets"
          :icon-color="severityColor(module)"
          slim
        >
          <template #default>
            <v-flex
              class="caption text-uppercase font-weight-medium grey--text text--darken-1"
              v-html="severityCounter(module)"
            >
            </v-flex>
            <v-flex
              class="caption font-weight-medium grey--text text--darken-1 text-xs-right pr-4"
            >
              <v-tooltip bottom>
                <span slot="activator">
                  <span
                    class="grey--text text--darken-4"
                    v-if="$vuetify.breakpoint.lgAndUp"
                  >
                    {{ $t('host.modules.lastCheck') | capitalize }}:
                  </span>
                  {{ formattedTime(module.timestamp) }}
                </span>
                {{ formattedDateTime(module.timestamp) }}
              </v-tooltip>
            </v-flex>
          </template>
        </ExpansionPanelHeader>
      </template>
      <div>
        <Module :value="module" />
      </div>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
  import ExpansionPanelHeader from '@/components/Hosts/ExpansionPanelHeader';
  import Module from '@/components/Hosts/Modules/Module';

  import useDateTime from '@/mixins/useDateTime';
  import moduleMixins from '@/mixins/module';

  export default {
    components: {
      ExpansionPanelHeader,
      Module,
    },
    mixins: [
      useDateTime,
      moduleMixins
    ],
    props: {
      items: {
        type: Array,
        required: true
      }
    },
  }
</script>
