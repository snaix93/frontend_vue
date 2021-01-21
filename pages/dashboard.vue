<template>
  <v-layout column fill-height justify-start>
    <FrozenPlanMessage v-if="$auth.team.onFrozenPlan()"/>
    <template v-else>
      <PageToolbar :class="{ 'fill-width ma-0': TVMode }">
        <v-toolbar-title v-if="$auth.team.onFrozenPlan()">
          {{ $t('phrase.dashboard') | capitalize }}
        </v-toolbar-title>
        <template v-else>
          <DashboardViewTypeButtons/>
          <v-divider v-if="$vuetify.breakpoint.mdAndUp" class="mx-3" dark vertical/>
          <AppTVModeToggle/>
          <v-divider class="mx-3" dark vertical/>
          <DashboardRefresher/>
        </template>
      </PageToolbar>

      <v-layout
        column
        data-cy="dashboardContent"
        fill-height
        justify-start
        wrap
      >
        <NuxtChild keep-alive/>
      </v-layout>

    </template>
  </v-layout>
</template>

<script>
  import { mapState } from 'vuex';
  import DashboardViewTypeButtons from '@/components/Dashboard/DashboardViewTypeButtons';
  import DashboardSettingsFlyOut from '@/components/Dashboard/DashboardSettingsFlyOut';
  import DashboardRefresher from '@/components/Dashboard/DashboardRefresher';
  import FrozenPlanMessage from '@/components/Dashboard/FrozenPlanMessage';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import AppTVModeToggle from '@/components/App/AppTVModeToggle';

  export default {
    layout: 'admin',
    components: {
      DashboardViewTypeButtons,
      DashboardSettingsFlyOut,
      DashboardRefresher,
      FrozenPlanMessage,
      AppTVModeToggle,
      PageToolbar
    },
    computed: {
      ...mapState('dashboard', ['TVMode']),
    },
    created() {
      if (this.$route.matched.length === 1) {
        this.$router.push(`/dashboard/hosts`);
      }
    },
  };
</script>

<style lang="stylus">
  .tabs-items-dashboard .v-window__container--is-active
    height: auto !important

  .toolbar-dashboard
    .v-toolbar__content
      padding-right: 0 !important

  .open-chart
    cursor: pointer
    transition: background 0.3s ease-in

    &:hover
      background: #f4f4f4

  .footer-dashboard
    bottom: 0

  .refresh-timer
    &__heading
      opacity: 0.7
      white-space: nowrap
</style>
