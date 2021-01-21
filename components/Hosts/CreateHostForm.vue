<template>
  <v-flex grow>
    <AdminHostForm
      :Host="Host"
      @on-create="onCreate"
      @on-cancel="onCancel"
    />
  </v-flex>
</template>

<script>
  import AdminHostForm from '@/components/Hosts/AdminHostForm';
  import hostMixins from '@/mixins/host';
  import Host from '@/models/Host';

  export default {
    name: 'CreateHostForm',
    components: { AdminHostForm },
    mixins: [
      hostMixins
    ],
    data() {
      return {
        Host: new Host(JSON.parse(JSON.stringify(Host.attributes))),
      };
    },
    methods: {
      onCancel() {
        this.$router.push('/hosts');
      },
      onCreate({ Host, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.hostAdd'));
          this.$router.push(`/hosts/${Host.id}/host-added`);
        } else {
          this.$flash.error(this.$t('message.error.hostAdd'));
        }
      },
    },
  };
</script>
