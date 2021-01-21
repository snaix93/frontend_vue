<template>
  <v-layout justify-center>
    <PageToolbar>
      <v-toolbar-title>
        {{ $t('host.name') | capitalize }}
        <span
          v-if="showRemainingText"
          class="caption grey--text text--lighten-1"
        >
          ({{ $t('phrase.remaining', { remaining: host_hostsRemaining }) }})
        </span>
      </v-toolbar-title>
      <v-spacer/>
      <AppCreateButton
        :label="$t('button.createHost')"
        :upgrade="host_countMaxExceeded"
        :upgrade-msg="$t('message.general.maxAmount', { items: 'hosts' })"
      />
    </PageToolbar>
    <HostsTable @on-delete="onHostDelete"/>
  </v-layout>
</template>

<script>
  import AppCreateButton from '@/components/App/AppCreateButton';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import HostsTable from '@/components/Hosts/HostsTable';
  import hostMixins from '@/mixins/host';
  import userMixins from '@/mixins/user';

  export default {
    name: 'hosts',
    layout: 'admin',
    components: {
      AppCreateButton,
      PageToolbar,
      HostsTable,
    },
    mixins: [hostMixins, userMixins],
    computed: {
      showRemainingText() {
        return ! this.host_countMaxExceeded
               && this.host_hostsRemaining
               && this.$auth.user.isNotReadOnly();
      },
    },
    methods: {
      onHostDelete({ Host, success }) {
        let type = success ? 'success' : 'error';
        this.$flash.success(this.$t(`message.${type}.hostDelete`, { name: Host.name }));
      },
    },
  };
</script>
