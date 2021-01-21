<template>
  <v-footer
    v-if="totalHostCount > 0"
    absolute
    class="footer-dashboard"
    color="transparent"
    flat
    height="auto"
  >
    <v-toolbar
      color="transparent"
      flat
      height="74px"
    >
      <template v-if="!TVMode && $auth.user.isNotReadOnly()">
        <v-spacer class="hidden-sm-and-down"/>
        <v-layout
          :shrink="$vuetify.breakpoint.mdAndUp"
          align-center
          ma-0 wrap
        >
          <v-flex
            :px-3="$vuetify.breakpoint.mdAndUp"
            class="text-xs-center text-md-right"
            py-0
          >
            <v-toolbar-title class="body-1 grey--text text--darken-2">
              {{ $t('dashboard.monitoredFrom') | capitalize }}
              {{ $auth.team.frontmanLocation }}
            </v-toolbar-title>
          </v-flex>
          <v-flex
            class="text-no-wrap text-xs-center text-md-right"
            pa-0
          >
            <v-btn
              class="qa-add-host-btn"
              color="primary"
              @click="host_goToCreateHost"
            >
              {{ $t('dashboard.addHost') | capitalize }}
            </v-btn>
            <v-btn
              class="mr-0"
              color="primary"
              @click="toggleWebCheckWizardDialog"
            >
              {{ $t('dashboard.createWebMonitoring') | capitalize }}
            </v-btn>
          </v-flex>
        </v-layout>
      </template>
    </v-toolbar>
  </v-footer>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import CheckSuccessDialog from '@/components/Hosts/Checks/CheckSuccessDialog';
  import HostMixin from '@/mixins/host';

  export default {
    name: 'HostDashboardFooter',
    components: {
      CheckSuccessDialog
    },
    mixins: [HostMixin],
    computed: {
      ...mapState('dashboard', [
        'totalHostCount', 'TVMode'
      ]),
    },
    methods: {
      ...mapMutations('dashboard', ['toggleWebCheckWizardDialog']),
    },
  };
</script>

<style scoped>

</style>
