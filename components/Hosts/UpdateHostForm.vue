<template>
  <v-dialog
    v-model="dialog"
    max-width="960"
    persistent
    scrollable
  >
    <AdminHostForm
      v-if="dialog"
      :Host="selectedHost"
      @on-update="onUpdate"
      @on-cancel="onCancel"
    />
  </v-dialog>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import AdminHostForm from '@/components/Hosts/AdminHostForm';

  export default {
    name: 'UpdateHostForm',
    components: { AdminHostForm },
    computed: {
      ...mapState('hosts', {
        dialog: 'updateDialog',
      }),
      ...mapState('hosts', ['selectedHost']),
    },
    methods: {
      ...mapMutations('hosts', ['toggleUpdateDialog']),
      onUpdate({ Host, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.hostSaved', {
            name: Host.name,
          }));
          this.toggleUpdateDialog(false);
          this.$emit('on-update', { Host });
        } else {
          this.$flash.error(this.$t('message.error.hostSaved', {
            name: Host.name,
          }));
        }
      },
      onCancel({ Host }) {
        this.toggleUpdateDialog(false);
        this.$emit('on-cancel', { Host });
      },
    },
  };
</script>

<style scoped>

</style>
