<template>
  <v-dialog
    persistent
    :value="dialog"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ $t('checks.jobmonInfoDialog.title') | capitalize }}
        </span>

        <v-spacer/>
        <v-btn
          icon
          class="mr-0"
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <p>
          <span v-html="$t('checks.jobmonInfoDialog.paragraph1', {classList})"/>
          <span v-html="$t('checks.jobmonInfoDialog.paragraph2', {classList})"/>
        </p>
        <p>{{ $t('checks.jobmonInfoDialog.paragraph3') | capitalize }}</p>

        <div class="code primary darken-2 elevation-4 mb-3">
          <div class="code--header">
            <v-chip
              color="primary darken-4"
              class="code--label primary--text text--lighten-1 ma-0"
              label
              small
            >
              {{ $t('checks.jobmonInfoDialog.exampleForLinux') | capitalize }}
            </v-chip>
          </div>
          <kbd class="pa-3">jobmon -id myBackup -- rsync -aq /etc /var/backups/</kbd>
        </div>

        <div class="code primary darken-2 elevation-4">
          <div class="code--header">
            <v-chip
              color="primary darken-4"
              class="code--label primary--text text--lighten-1 ma-0"
              label
              small
            >
              {{ $t('checks.jobmonInfoDialog.exampleForWindows') | capitalize }}
            </v-chip>
          </div>
          <kbd class="pa-3">jobmon -id myBackup -- robocopy /MIR C:\Users\Administrator\Documents C:\Backups</kbd>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          block
          outline
          color="secondary"
          :href="`${app_knowledgeBaseUrl}configuring-hosts/managing-checks/job-monitoring`"
          target="_blank"
        >
          {{ $t('phrase.learnMore') | capitalize }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import CopyField from '@/components/App/CopyField';

  import appMixins from '@/mixins/app';

  export default {
    components: {
      CopyField,
    },
    mixins: [appMixins],
    data() {
      return {
        classList: 'd-inline-block grey lighten-3 font-monospace pa-1',
      };
    },
    computed: {
      ...mapState('jobmonResults', {
        dialog: 'jobmonInfoDialog',
      }),
    },
    methods: {
      ...mapMutations('jobmonResults', [
        'toggleJobmonInfoDialog',
      ]),
      onCancel() {
        this.$emit('cancel');
        this.toggleJobmonInfoDialog(false);
      },
    },
  };
</script>
