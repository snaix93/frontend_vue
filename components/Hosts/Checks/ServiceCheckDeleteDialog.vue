<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    custom-dialog-hide-mutation="serviceChecks/toggleDeleteDialog"
    :wait="waitKey"
    @confirm="deleteServiceCheck"
  >
    <template #content>
      <template v-if="selectedServiceCheck && selectedServiceCheck.port">
        {{ $t('checks.deleteConfirm', { port: selectedServiceCheck.port }) }}
      </template>
      <template v-else>
        {{ $t('checks.deleteICMPConfirm') }}
      </template>
    </template>
    <template #button>
      <v-icon>delete</v-icon>
      {{ $t('button.delete') }}
    </template>
  </AppConfirmDialog>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import AppConfirmDialog from '@/components/App/AppConfirmDialog';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import AppMixin from '@/mixins/app';

  export default {
    components: {
      AppConfirmDialog,
    },
    mixins: [useBackendValidation, AppMixin],
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('serviceChecks', {
        dialog: 'deleteDialog',
      }),
      ...mapState('serviceChecks', ['selectedServiceCheck']),
      waitKey() {
        return this.$WAIT_FOR.SERVICE_CHECK.CONFIRM_DELETE_ID(this.selectedServiceCheck.id);
      }
    },
    methods: {
      ...mapActions('serviceChecks', {
        deleteServiceCheckAction: 'deleteServiceCheck',
      }),
      deleteServiceCheck({ onSuccess, onFailed }) {
        this.useBackendValidation_reset();
        this.deleteServiceCheckAction({ ServiceCheck: this.selectedServiceCheck, Host: this.Host })
            .then(() => {
              this.$emit('on-delete', { success: true, ServiceCheck: this.selectedServiceCheck });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, ServiceCheck: this.selectedServiceCheck });
            });
      },
    },
  };
</script>
