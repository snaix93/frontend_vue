<template>
  <v-dialog
    v-model="dialog"
    max-width="400px"
    persistent
  >
    <v-card>
      <v-card-title class="subheading">
        {{ $t('team.doYouWantToGrantTheSupportAccess') | capitalize }}
      </v-card-title>
      <v-card-text
        class="mt-0 pt-0"
        v-html="$t('team.confirmSupportInvitation')"
      />
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          flat
          @click="onCancel"
        >
          {{ $t('button.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          flat
          @click="inviteTeamMember"
        >
          <slot name="button">
            {{ $t('button.confirm') }}
          </slot>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import useDateTime from '@/mixins/useDateTime';
  import User from '@/models/User';

  export default {
    mixins: [useDateTime],
    computed: {
      ...mapState('teamMembers', {
        teamMember: 'selectedTeamMember',
        dialog: 'inviteSupportDialog',
      }),
    },
    methods: {
      ...mapActions('teamMembers', {
        inviteTeamMemberAction: 'inviteTeamMember',
      }),
      ...mapActions('team', {
        hideSupportButtonAction: 'hideSupportButton',
      }),
      ...mapMutations('teamMembers', ['toggleSupportDialog']),
      onCancel() {
        this.toggleSupportDialog();
      },
      inviteTeamMember() {
        this.teamMember.role = User.userRoles.ADMIN;
        this.teamMember.email = `support+${this.timestampNowExact()}@cloudradar.co`;

        this.inviteTeamMemberAction({ TeamMember: this.teamMember })
            .then(async () => {
              await this.hideSupportButtonAction(true);
              this.$emit('on-create', { success: true, TeamMember: this.teamMember });
            })
            .catch(({ response }) => {
              this.$emit('on-create', { success: false, TeamMember: this.teamMember });
            });
      }
    },
  };
</script>

