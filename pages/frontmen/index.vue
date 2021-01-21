<template>
  <v-layout justify-center>
    <PageToolbar>
      <v-toolbar-title>
        {{ $tc('frontman.name') | capitalize }}
      </v-toolbar-title>
      <v-spacer/>
      <AppCreateButton
        :label="$t('button.addFrontman')"
        :upgrade="frontmen_frontmenExceeded || (user_trialRemaining === 0 && $auth.user.onTrial())"
        :upgrade-msg="$t('message.general.maxAmount', { items: 'frontmen' })"
      />
    </PageToolbar>
    <v-flex grow>
      <FrontmenGrid
        @on-update="onUpdate"
        @on-delete="onDelete"
      />
    </v-flex>
    <FrontmanDialog
      v-if="frontmanDialog"
      @on-create="onCreate"
      @on-update="onUpdate"
    />
  </v-layout>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import AppCreateButton from '@/components/App/AppCreateButton.vue';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar.vue';
  import FrontmanDialog from '@/components/Frontmen/FrontmanDialog';
  import FrontmenGrid from '@/components/Frontmen/FrontmenGrid';
  import frontmenMixins from '@/mixins/frontmen';
  import AppWait from '@/components/App/AppWait';
  import userMixins from '@/mixins/user';
  import appMixins from '@/mixins/app';

  export default {
    layout: 'admin',
    middleware: 'canWrite',
    components: {
      AppWait,
      AppCreateButton,
      PageToolbar,
      FrontmanDialog,
      FrontmenGrid,
    },
    mixins: [appMixins, frontmenMixins, userMixins],
    computed: {
      ...mapState('frontmen', ['frontmanDialog']),
    },
    methods: {
      ...mapMutations('frontmen', ['toggleFrontmanDialog']),
      onCreate({ Frontman, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.frontmanAdd'));
          this.toggleFrontmanDialog();
        } else {
          this.$flash.error(this.$t('message.error.frontmanAdd'));
        }
      },
      onUpdate({ Frontman, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.frontmanSaved', {
            frontman: this.stringPreview(Frontman.location, 28),
          }));
          this.toggleFrontmanDialog();
        } else {
          this.$flash.error(this.$t('message.error.frontmanSaved', {
            frontman: this.stringPreview(Frontman.location, 28),
          }));
        }
      },
      onDelete({ Frontman, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.frontmanDelete', {
            frontman: this.stringPreview(Frontman.location, 28),
          }));
        } else {
          this.$flash.error(this.$t('message.error.frontmanDelete', {
            frontman: this.stringPreview(Frontman.location, 28),
          }));
        }
      },
    },
  };
</script>
