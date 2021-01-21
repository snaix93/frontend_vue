<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    custom-dialog-hide-mutation="frontmen/toggleDeleteDialog"
    :wait="waitKey"
    @confirm="deleteFrontman"
  >
    <template #content>
      {{ $t('frontman.deleteConfirm', {
        frontman: stringPreview(selectedFrontman.location, 36),
      }) }}
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
      ...mapState('frontmen', {
        dialog: 'deleteDialog',
      }),
      ...mapState('frontmen', ['selectedFrontman']),
      waitKey() {
        return this.$WAIT_FOR.FRONTMAN.CONFIRM_DELETE_ID(this.selectedFrontman.id);
      }
    },
    methods: {
      ...mapActions('frontmen', {
        deleteFrontmanAction: 'deleteFrontman',
      }),
      deleteFrontman({ onSuccess, onFailed }) {
        this.useBackendValidation_reset();
        this.deleteFrontmanAction({ Frontman: this.selectedFrontman })
            .then(() => {
              this.$emit('on-delete', { success: true, Frontman: this.selectedFrontman });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, Frontman: this.selectedFrontman });
            });
      },
    },
  };
</script>
