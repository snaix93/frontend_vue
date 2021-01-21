<template>
  <v-layout
    justify-center
    row
  >
    <PageToolbar>
      <v-toolbar-title>
        {{ $tc('recipients.name') | capitalize }}
        <span
          v-if="!recipient_recipientsExceeded"
          class="caption grey--text text--lighten-1"
        >
          ({{ $t('phrase.remaining', { remaining: recipient_recipientsRemaining, }) }})
        </span>
      </v-toolbar-title>
      <v-spacer/>
      <AppCreateButton
        v-if="shouldShowCreateButton"
        :label="$t('button.addRecipient')"
        :upgrade="recipient_recipientsExceeded"
        :upgrade-msg="
          $t('message.general.maxAmount', { items: 'recipients' })
        "
      />
    </PageToolbar>
    <v-flex grow>
      <ResendVerificationEmailAlert>
        To activate and set up alerts via Email or other media, please confirm your email address. We have sent a verification link to your email.
      </ResendVerificationEmailAlert>

      <RecipientsTable
        @on-update="onUpdateRecipient"
        @on-verify="onVerifyRecipient"
        @on-getLogs="onGetLogs"
      />

      <RecipientDialog
        v-if="recipientDialog"
        @on-create="onCreateRecipient"
        @on-update="onUpdateRecipient"
        @on-verify="onVerifyRecipient"
        @on-getLogs="onGetLogs"
      />

      <RecipientDeleteDialog
        v-if="deleteDialog"
        @on-delete="onDeleteRecipient"
      />

      <LogsDialog v-if="logsDialog"/>
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import recipientMixins from '@/mixins/recipient';

  import AppCreateButton from '@/components/App/AppCreateButton.vue';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar.vue';
  import RecipientDialog from '@/components/Recipients/RecipientDialog';
  import LogsDialog from '@/components/Recipients/LogsDialog';
  import RecipientsTable from '@/components/Recipients/RecipientsTable';
  import RecipientDeleteDialog from '@/components/Recipients/RecipientDeleteDialog';
  import ResendVerificationEmailAlert from '@/components/Auth/ResendVerificationEmailAlert';

  export default {
    name: 'recipients',
    layout: 'admin',
    components: {
      ResendVerificationEmailAlert,
      RecipientDeleteDialog,
      AppCreateButton,
      PageToolbar,
      RecipientDialog,
      LogsDialog,
      RecipientsTable,
    },
    mixins: [recipientMixins],
    middleware: 'canWrite',
    computed: {
      ...mapState('recipients', [
        'selectedRecipient',
        'recipientDialog',
        'deleteDialog',
        'logsDialog'
      ]),
      ...mapState('recipients', {
        recipientsCount: 'totalCount'
      }),
      shouldShowCreateButton() {
        return ! (this.$auth.user.isAdmin() && ! this.$auth.user.emailVerified);
      }
    },
    methods: {
      ...mapMutations('recipients', [
        'toggleRecipientDialog',
        'toggleLogsDialog',
      ]),
      onCreateRecipient({ success = true }) {
        if (success) {
          this.toggleRecipientDialog(false);
          this.$flash.success(this.$t('message.success.recipientAdd'));
        } else {
          this.$flash.error(this.$t('message.error.recipientAdd'));
        }
      },
      onUpdateRecipient({ success = true }) {
        if (success) {
          this.toggleRecipientDialog(false);
          this.$flash.success(this.$t('message.success.recipientSaved'));
        } else {
          this.$flash.error(this.$t('message.error.recipientSaved'));
        }
      },
      onDeleteRecipient({ success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.recipientDelete'));
        } else {
          this.$flash.error(this.$t('message.error.recipientDelete'));
        }
      },
      onVerifyRecipient({ success = true, Recipient }) {
        if (success) {
          this.$flash.success(this.$t('message.success.resendVerificationLink', { email: Recipient.sendto }));
        } else {
          this.$flash.error(this.$t('message.error.resendVerificationLink', { email: Recipient.sendto }));
        }
      },
      onGetLogs() {
        this.toggleLogsDialog(true);
      }
    },
  };
</script>
