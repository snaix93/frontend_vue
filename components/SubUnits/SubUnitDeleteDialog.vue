<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    custom-dialog-hide-mutation="subUnits/toggleDeleteDialog"
    :wait="waitKey"
    @confirm="deleteSubUnit"
  >
    <template #content>
      {{ $t('subUnit.deleteConfirm', { subUnit: selectedSubUnit.shortId }) }}
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
      ...mapState('subUnits', {
        dialog: 'deleteDialog',
      }),
      ...mapState('subUnits', ['selectedSubUnit']),
      waitKey() {
        return this.$WAIT_FOR.SUB_UNIT.CONFIRM_DELETE_ID(this.selectedSubUnit.id);
      }
    },
    methods: {
      ...mapActions('subUnits', {
        deleteSubUnitAction: 'deleteSubUnit',
      }),
      deleteSubUnit({ onSuccess, onFailed }) {
        this.useBackendValidation_reset();
        this.deleteSubUnitAction({ SubUnit: this.selectedSubUnit })
            .then(() => {
              this.$emit('on-delete', { success: true, SubUnit: this.selectedSubUnit });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, SubUnit: this.selectedSubUnit });
            });
      },
    },
  };
</script>
