<template>
  <v-expansion-panel
    v-model="showCustomizeHostTablePanel"
    expand
  >
    <v-expansion-panel-content>
      <v-divider/>
      <v-card>
        <v-card-text class="pa-0">
          <v-divider/>
          <v-subheader class="grey lighten-3 subheading">
            <v-icon>fas fa-table</v-icon>
            <span class="ml-3">{{ $t('host.customizeTable') | capitalize }}</span>
          </v-subheader>
          <v-divider/>
          <v-layout pa-3 wrap>
            <v-flex
              v-for="(header, key) in headers"
              :key="key"
              xs3
            >
              <v-checkbox
                v-if="header.customizeOptions"
                v-model="header.customizeOptions.enabled"
                :label="`${$options.filters.capitalize(header.customizeOptions.text)}`"
                @change="save"
              />
            </v-flex>
          </v-layout>
          <v-divider/>
        </v-card-text>
      </v-card>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
  export default {
    props: {
      value: {},
      headers: {
        type: Array,
        required: true,
      },
    },
    computed: {
      showCustomizeHostTablePanel() {
        return [this.value];
      },
    },
    async created() {
      this.updateTable();
    },
    methods: {
      updateTable() {
        let dataTableSettings = this.$userSettings.get('host.dataTableSettings');

        if (dataTableSettings.length === 0) return;

        dataTableSettings.forEach((customSetting) => {
          this.headers.map(({ customizeOptions }) => {
            if (customizeOptions && customizeOptions.key === customSetting.key) {
              customizeOptions.enabled = customSetting.enabled;
            }
            return customizeOptions;
          });
        });
      },
      save() {
        const dataToSave = [];
        this.headers.forEach(({ customizeOptions }) => {
          if (customizeOptions && !customizeOptions.enabled) {
            dataToSave.push({ key: customizeOptions.key, value: customizeOptions.enabled });
          }
        });

        this.$userSettings.set('host.dataTableSettings', dataToSave).save();
      },
    },
  };
</script>
