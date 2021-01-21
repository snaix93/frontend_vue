<template>
  <v-layout justify-center>
    <PageToolbar>
      <v-toolbar-title>
        {{ $tc('team.name') | capitalize }}
        <span
          v-if="!teamSizeExceeded"
          class="caption grey--text text--lighten-1"
        >
          ({{
            $t('team.slotsRemaining', {
              remaining: ($auth.team.maxMembers - $auth.team.counts.members)
            })
          }})
        </span>
      </v-toolbar-title>
      <v-spacer/>
      <v-btn
        v-show="!$auth.team.hasGrantedAccessToSupport"
        class="mr-0"
        data-cy="grantAccessToSupport"
        flat
        @click="showSupportDialog"
      >
        <v-icon left>
          assignment_ind
        </v-icon>
        {{ $t('team.grantAccessToSupport') }}
      </v-btn>
      <AppCreateButton
        v-if="shouldShowCreateButton"
        :label="$t('button.inviteTeamMember')"
        :upgrade="teamSizeExceeded"
        :upgrade-msg="$t('message.general.maxAmount', { items: 'team members' })"
      />
    </PageToolbar>
    <v-flex grow>
      <ResendVerificationEmailAlert>
        To invite teammates to your monitoring account, please confirm your email address. We have sent a verification
        link to your email.
      </ResendVerificationEmailAlert>

      <MembersTable
        @on-update="onUpdate"
        @on-delete="onDelete"
        @on-resend="onResend"
      />
      <InviteTeamMemberDialog
        v-if="inviteTeamMemberDialog"
        @on-create="onCreate"
      />
      <InviteSupportDialog
        v-if="inviteSupportDialog"
        @on-create="onCreate"
      />
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import ResendVerificationEmailAlert from '@/components/Auth/ResendVerificationEmailAlert';
  import InviteTeamMemberDialog from '@/components/Team/InviteTeamMemberDialog';
  import InviteSupportDialog from '@/components/Team/InviteSupportDialog';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import AppCreateButton from '@/components/App/AppCreateButton';
  import MembersTable from '@/components/Team/MembersTable';
  import TeamMember from '@/models/TeamMember';
  import userMixins from '@/mixins/user';

  export default {
    layout: 'admin',
    components: {
      ResendVerificationEmailAlert,
      InviteTeamMemberDialog,
      InviteSupportDialog,
      AppCreateButton,
      MembersTable,
      PageToolbar,
    },
    mixins: [userMixins],
    middleware: 'canWrite',
    computed: {
      ...mapState('teamMembers', [
        'totalCount',
        'inviteSupportDialog',
        'inviteTeamMemberDialog',
      ]),
      shouldShowCreateButton() {
        return ! (this.$auth.user.isAdmin() && ! this.$auth.user.emailVerified)
               && !this.teamSizeExceeded;
      },
      teamSizeExceeded() {
        return this.$auth.team.counts.members >= this.$auth.team.maxMembers;
      },
    },
    methods: {
      ...mapMutations('teamMembers', [
        'toggleSupportDialog',
        'setSelectedTeamMember',
        'toggleTeamMemberDialog'
      ]),
      onCreate({ TeamMember, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.teamMemberInvite', {
            email: TeamMember.email,
          }));
        } else {
          this.$flash.error(this.$t('message.error.teamMemberInvite', {
            email: TeamMember.email,
          }));
        }

        this.toggleTeamMemberDialog(false);
        this.toggleSupportDialog(false);
      },
      onUpdate({ TeamMember, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.teamMemberSaved', {
            email: TeamMember.email,
          }));
        } else {
          this.$flash.error(this.$t('message.success.teamMemberSaved', {
            email: TeamMember.email,
          }));
        }
      },
      onDelete({ TeamMember, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.teamMemberDelete', {
            email: TeamMember.email,
          }));
        } else {
          this.$flash.error(this.$t('message.error.teamMemberDelete', {
            email: TeamMember.email,
          }));
        }
      },
      onResend({ TeamMember, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.resendTeamMemberInvitation', {
            email: TeamMember.email,
          }));
        } else {
          this.$flash.error(this.$t('message.error.resendTeamMemberInvitation', {
            email: TeamMember.email,
          }));
        }
      },
      showSupportDialog() {
        this.setSelectedTeamMember(new TeamMember({ ...TeamMember.attributes }));
        this.toggleSupportDialog(true);
      },
    },
  };
</script>
