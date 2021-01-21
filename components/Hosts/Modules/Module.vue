<template>
  <v-expansion-panel
    expand
  >
    <ModulePanel
      :value="value.alerts"
      :disabled="!hasAlerts"
    >
      <template v-slot:title>
        <span class="caption font-weight-bold">
          {{ $t('phrase.alerts') | capitalize }}
        </span>
      </template>
      <template v-slot:description>
        <div class="font-monospace grey--text text--darken-1 text-truncate">
          {{ alertsPrev }}
        </div>
      </template>
    </ModulePanel>
    <ModulePanel
      :value="value.warnings"
      :disabled="!hasWarnings"
    >
      <template v-slot:title>
        <span class="caption font-weight-bold">
          {{ $t('phrase.warnings') | capitalize }}
        </span>
      </template>
      <template v-slot:description>
        <div class="font-monospace grey--text text--darken-1 text-truncate">
          {{ warningsPrev }}
        </div>
      </template>
    </ModulePanel>

    <ModulePanel
      :value="measurement.value"
      v-for="(measurement, i) in measurements"
      :key="`moduleMeasurement-${i}`"
    >
      <template v-slot:title>
        {{ measurement.key }}
      </template>
    </ModulePanel>

    <ModulePanel
      :value="value['command executed']"
      >
        <template v-slot:title>
          {{ $t('host.modules.commandExecuted') | capitalize }}
        </template>
      </ModulePanel>
  </v-expansion-panel>
</template>
<script>
  import ModulePanel from '@/components/Hosts/Modules/ModulePanel'

  export default {
    components: {
      ModulePanel,
    },
    props: {
      value: {
        type: Object,
        required: true
      }
    },
    computed: {
      hasAlerts() {
        return !!this.value.alerts?.length;
      },
      hasWarnings() {
        return !!this.value.warnings?.length;
      },
      alertsPrev() {
        const numberOfItems = this.value.alerts.length > 1 ? 2 : 1;
        return this.value.alerts.slice(0, numberOfItems).join(', ');
      },
      warningsPrev() {
        const numberOfItems = this.value.warnings.length > 1 ? 2 : 1;
        return this.value.warnings.slice(0, numberOfItems).join(', ');
      },
      measurements() {
        const result = [];

        const rawMeasurments = this.value.measurements;

        if(!!rawMeasurments)
          Object.keys(rawMeasurments).forEach((key) => {
            result.push({
              key,
              value: rawMeasurments[key]
            })
          });

        return result;
      },

    }
  }
</script>
