<template>
  <v-dialog
    :value="dialog"
    lazy
    persistent
    width="500"
  >
    <v-card class="success-dialog">
      <v-card-text class="text-xs-center pb-4">
        <h2 class="headline my-3">
          <template v-if="isDone">
            {{ $t('host.addHostCheckSuccessDialog.doneHeading') }}
          </template>
          <template v-else>
            {{ $t('host.addHostCheckSuccessDialog.almostDoneHeading') }}
          </template>
        </h2>

        <v-list class="mx-3 mb-3">
          <v-list-tile avatar>
            <v-list-tile-avatar>
              <SuccessIcon
                height="30px"
                width="30px"
              />
            </v-list-tile-avatar>

            <v-list-tile-content>
              {{ $t('host.addHostCheckSuccessDialog.hostBeingMonitored') }}
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile avatar>
            <v-list-tile-avatar>
              <SuccessIcon
                height="30px"
                width="30px"
              />
            </v-list-tile-avatar>

            <v-list-tile-content>
              {{ $t('host.addHostCheckSuccessDialog.alertingRulesCreated') }}
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile avatar>
            <v-list-tile-avatar>
              <template v-show="!$fetchState.pending">
                <SuccessIcon
                  v-if="isDone"
                  height="30px"
                  width="30px"
                />
                <WarningIcon
                  v-else
                  height="30px"
                  width="30px"
                />
              </template>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <template v-if="$fetchState.pending">
                {{ $t('host.addHostCheckSuccessDialog.recipientsChecking') }}
              </template>
              <template v-else>
                {{ isDone ? $t('host.addHostCheckSuccessDialog.recipientsSetup') : $t('host.addHostCheckSuccessDialog.recipientsNotSetup') }}
              </template>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <div v-show="!$fetchState.pending">
          <v-btn
            color="success"
            large
            @click="isDone ? closeDialog() : addRecipient()"
          >
            {{ isDone ? $t('host.addHostCheckSuccessDialog.doneButtonText') : $t('host.addHostCheckSuccessDialog.almostDoneButtonText') }}
          </v-btn>

          <v-btn
            class="secondary-btn"
            depressed
            @click="isDone ? dontShowDialogAgain() : closeDialog()"
          >
            {{ isDone ? $t('host.addHostCheckSuccessDialog.doneSecondaryButtonText') : $t('host.addHostCheckSuccessDialog.almostDoneSecondaryButtonText') }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import SuccessIcon from '@/components/App/SuccessIcon';
  import WarningIcon from '@/components/App/WarningIcon';
  import userMixins from '@/mixins/user';

  export default {
    components: {
      SuccessIcon,
      WarningIcon,
    },
    mixins: [userMixins],
    data() {
      return {
        showList: false
      };
    },
    computed: {
      ...mapState('hosts', ['checkSuccessDialog']),
      ...mapState('recipients', ['recipients']),
      hasRecipients() {
        return !! this.recipients.length;
      },
      hasActiveRecipient() {
        if (this.recipients.length === 0) {
          return false;
        }
        return !! this.recipients.find(recipient => recipient.active);
      },
      isDone() {
        return !! this.hasActiveRecipient;
      },
      dialog() {
        if (this.checkSuccessDialog && (this.userMarkedDialogDoNotShow || this.$auth.user.isReadOnly())) {
          this.closeDialog();
          return false;
        }
        return this.checkSuccessDialog;
      },
      userMarkedDialogDoNotShow() {
        return ! this.$userSettings.get('autoShow.hostCheckSuccess');
      },
    },
    async fetch() {
      if (this.$userSettings.get('autoShow.hostCheckSuccess')) {
        await this.getRecipients();
      }
    },
    methods: {
      ...mapMutations('hosts', ['toggleCheckSuccessDialog']),
      ...mapMutations('recipients', ['resetSelectedRecipient', 'toggleRecipientDialog']),
      ...mapActions('recipients', ['getRecipients']),
      triggerTransitionOfList() {
        this.showList = true;
      },
      addRecipient() {
        this.closeDialog();
        this.$router.push('/recipients');

        if (! this.hasRecipients) {
          this.resetSelectedRecipient('email');
          this.toggleRecipientDialog(true);
        }
      },
      closeDialog() {
        this.toggleCheckSuccessDialog(false);
      },
      dontShowDialogAgain() {
        this.$userSettings.set('autoShow.hostCheckSuccess', false)
            .save()
            .then(() => {
              this.closeDialog();
            });
      },
    },
  };
</script>
