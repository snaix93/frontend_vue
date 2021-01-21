<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    :wait="waitKey"
    custom-dialog-hide-mutation="teamMembers/toggleDeleteDialog"
    @confirm="deleteItem"
  >
    <template #content>
      <BackendValidationAlert/>
      <p>
        {{ $t('team.deleteConfirm', { email: selectedTeamMember.email }) }}
      </p>
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
    mixins: [useBackendValidation],
    computed: {
      ...mapState('teamMembers', {
        dialog: 'deleteDialog',
      }),
      ...mapState('teamMembers', ['selectedTeamMember']),
      waitKey() {
        return this.$WAIT_FOR.TEAM_MEMBER.CONFIRM_DELETE_ID(this.selectedTeamMember.id);
      }
    },
    methods: {
      ...mapActions('teamMembers', {
        deleteTeamMemberAction: 'deleteTeamMember',
      }),
      deleteItem() {
        this.useBackendValidation_reset();
        this.deleteTeamMemberAction({ TeamMember: this.selectedTeamMember })
            .then(() => {
              this.$emit('on-delete', { success: true, TeamMember: this.selectedTeamMember });
            })
            .catch(({ response }) => {
              if (! this.useBackendValidation_renderAnyErrors(response)) {
                this.$emit('on-delete', { success: false, TeamMember: this.selectedTeamMember });
              }
            });
      },
    },
  };
</script>
