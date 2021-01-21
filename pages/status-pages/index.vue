<template>
  <v-layout
    row
    justify-center
  >
    <PageToolbar>
      <v-toolbar-title>
        {{ $t('statusPages.name') | capitalize }}
      </v-toolbar-title>
      <v-spacer/>
      <AppCreateButton
        :label="$t('statusPages.create')"
      />
    </PageToolbar>
    <v-flex
      grow
    >
      <v-card>
        <StatusPageTable
          @on-delete="onDelete"
        />

        <StatusPageDialog
          v-if="statusPageDialog"
          @on-create="onCreate"
          @on-update="onUpdate"
        />

        <EmbedWizardDialog/>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import {mapMutations, mapState} from 'vuex';
  import AppWait from '@/components/App/AppWait';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import AppCreateButton from '@/components/App/AppCreateButton.vue';
  import StatusPageTable from '@/components/StatusPages/StatusPageTable';
  import StatusPageDialog from '@/components/StatusPages/StatusPageDialog';
  import EmbedWizardDialog from '@/components/StatusPages/EmbedWizardDialog';

  export default {
    layout: 'admin',
    components: {
      AppWait,
      PageToolbar,
      StatusPageTable,
      AppCreateButton,
      StatusPageDialog,
      EmbedWizardDialog,
  },
    computed: {
      ...mapState('statusPages', [
        'statusPageDialog'
      ]),
    },
    methods: {
      ...mapMutations('statusPages', [
        'toggleStatusPageDialog'
      ]),
      onCreate({ StatusPage, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.statusPageCreate', {title: StatusPage.title}));
        } else {
          this.$flash.error(this.$t('message.error.statusPageCreate', {title: StatusPage.title}));
        }
        this.toggleStatusPageDialog();
      },
      onUpdate({ StatusPage, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.statusPageUpdate', {title: StatusPage.title}));
        } else {
          this.$flash.error(this.$t('message.error.statusPageUpdate', {title: StatusPage.title}));
        }
        this.toggleStatusPageDialog();
      },
      onDelete({ StatuPage, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.statusPageDelete'));
        } else {
          this.$flash.error(this.$t('message.error.statusPageDelete'));
        }
      },
    },
  };
</script>
