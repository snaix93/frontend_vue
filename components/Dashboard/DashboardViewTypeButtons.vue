<template>
  <v-btn-toggle
    v-model="view"
    class="transparent"
    light
    mandatory
    @change="changeView"
  >
    <v-btn
      :title="$t('dashboard.tileView') | capitalize"
      :value="DASHBOARD_VIEWS.CARD_MEDIUM"
      data-qa="dashboard:view-toggle:medium"
    >
      <v-icon color="secondary">
        view_module
      </v-icon>
    </v-btn>
    <v-btn
      :title="$t('dashboard.miniView') | capitalize"
      :value="DASHBOARD_VIEWS.CARD_MINI"
      data-qa="dashboard:view-toggle:mini"
    >
      <v-icon color="secondary">
        view_comfy
      </v-icon>
    </v-btn>
    <v-btn
      v-if="$vuetify.breakpoint.mdAndUp"
      :title="$t('dashboard.listView') | capitalize"
      :value="DASHBOARD_VIEWS.LIST"
      data-qa="dashboard:view-toggle:list"
    >
      <v-icon color="secondary">
        list
      </v-icon>
    </v-btn>
  </v-btn-toggle>
</template>

<script>
  import { DASHBOARD_VIEWS } from '@/constants/dashboard';

  export default {
    name: 'DashboardViewTypeButtons',
    data() {
      return {
        DASHBOARD_VIEWS,
        view: this.$userSettings.dashboard.view
      };
    },
    methods: {
      changeView(view) {
        this.$userSettings.set('dashboard.view', view).save();
      },
    },
  };
</script>
