<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    :wait="waitKey"
    custom-dialog-hide-mutation="hosts/toggleDeleteDialog"
    @confirm="deleteHost"
  >
    <template #content>
      <v-layout>
        <v-flex shrink>
          {{ $t('host.deleteConfirm', { name: selectedHost.name }) }}
        </v-flex>
        <v-spacer/>
        <HelpTooltip
          :tooltip="$tooltip('HOST_DELETE')"
          orientation="right"
        />
      </v-layout>
    </template>
    <template #content-body>
      <v-checkbox
        v-model="purgeReportsOfDeletedHost"
        :label="$t('host.purgeFromReports') | capitalize"
        class="mt-0"
        color="error"
      />
    </template>

    <template #button>
      <v-icon left>
        delete_forever
      </v-icon>
      {{ $t('button.delete') }}
    </template>
  </AppConfirmDialog>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import AppConfirmDialog from '@/components/App/AppConfirmDialog';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import HelpTooltip from '@/components/App/HelpTooltip';

  export default {
    components: {
      AppConfirmDialog,
      HelpTooltip,
    },
    mixins: [useBackendValidation],
    data() {
      return {
        purgeReportsOfDeletedHost: false,
      };
    },
    computed: {
      ...mapState('hosts', {
        dialog: 'deleteDialog',
      }),
      ...mapState('hosts', ['selectedHost']),
      waitKey() {
        return this.$WAIT_FOR.HOST.CONFIRM_DELETE_ID(this.selectedHost.id);
      }
    },
    methods: {
      ...mapActions('hosts', {
        deleteHostAction: 'deleteHost',
      }),
      deleteHost({ onSuccess, onFailed }) {
        this.useBackendValidation_reset();
        const params = {
          Host: this.selectedHost,
          purgeReports: this.purgeReportsOfDeletedHost,
        };
        this.deleteHostAction(params)
            .then(() => {
              this.$emit('on-delete', { success: true, Host: this.selectedHost });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, Host: this.selectedHost });
            });
      },
    },
  };
</script>
