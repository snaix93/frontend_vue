<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    :wait="waitKey"
    custom-dialog-hide-mutation="SNMPChecks/toggleDeleteDialog"
    @confirm="deleteSnmpCheck"
  >
    <template #content>
      {{ $t('checks.deleteSNMPCheckConfirm') }}
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

  export default {
    components: {
      AppConfirmDialog,
    },
    mixins: [
      useBackendValidation,
    ],
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('SNMPChecks', {
        dialog: 'deleteDialog',
      }),
      ...mapState('SNMPChecks', ['selectedSnmpCheck']),
      waitKey() {
        return this.$WAIT_FOR.SNMP_CHECK.CONFIRM_DELETE_ID(this.selectedSnmpCheck.id);
      }
    },
    methods: {
      ...mapActions('SNMPChecks', {
        deleteSnmpCheckAction: 'deleteSnmpCheck',
      }),
      deleteSnmpCheck({ onSuccess, onFailed }) {
        this.deleteSnmpCheckAction({ SnmpCheck: this.selectedSnmpCheck, Host: this.Host })
            .then(() => {
              this.$emit('on-delete', { success: true, SnmpCheck: this.selectedSnmpCheck });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, SnmpCheck: this.selectedSnmpCheck });
            });
      },
    },
  };
</script>
