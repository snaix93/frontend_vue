<template>
  <v-dialog
    :value="dialog"
    lazy
    max-width="960px"
    persistent
    transition="slide-y-reverse-transition"
  >
    <v-card>
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ $t('host.guide.title') | capitalize }}
          <v-btn
            :href="kbLink"
            :title="$t('host.guide.referToKbText')"
            class="mx-0"
            color="primary"
            flat
            icon
            target="_blank"
          >
            <v-icon>help_outline</v-icon>
          </v-btn>
        </span>
        <v-spacer/>

        <v-flex
          v-if="hasHosts"
          shrink
        >
          <v-checkbox
            v-model="dontShowNextTime"
            :label="$t('host.guide.dontShowAgainText')"
            class="ma-0 pa-0 mr-3"
            hide-details
          >
          </v-checkbox>
        </v-flex>
        <v-btn
          v-if="showCancelButton"
          class="mx-0"
          icon
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <Guide
        v-if="dialog"
        :has-hosts="hasHosts"
        @host-guide:add-private-frontman-host="onHostGuide"
      />
      <v-divider/>
      <AppWait
        :wait="$wait.is($WAIT_FOR.HOST.GUIDE)"
        height="100%"
      />
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapMutations, mapState, mapActions } from 'vuex';
  import AppWait from '@/components/App/AppWait';
  import Guide from '@/components/Hosts/Guide/Guide.vue';
  import appMixins from '@/mixins/app';
  import Host from '@/models/Host';

  export default {
    components: {
      AppWait,
      Guide,
    },
    mixins: [appMixins],
    props: {
      hide: {
        type: Boolean,
        required: false,
      }
    },
    data() {
      return {
        hosts: [],
        autoShow: false,
      };
    },
    computed: {
      ...mapState('hosts', ['guideDialog']),
      hasHosts() {
        return this.$auth.team.counts.hosts > 0;
      },
      kbLink() {
        return `${this.app_knowledgeBaseUrl}configuring-hosts/page/adding-hosts`;
      },
      dialog() {
        if (this.autoShow) return true;
        return this.guideDialog;
      },
      dontShowNextTime: {
        get() {
          return ! this.$userSettings.get('autoShow.hostGuide');
        },
        set(value) {
          this.$userSettings
              .set('autoShow.hostGuide', ! value)
              .save();
        }
      }
    },
    async mounted() {
      setTimeout(() => {
        let value = this.$userSettings.get('autoShow.hostGuide')

        if(this.hide) value = false;

        this.autoShow = value;
      }, 300);
    },
    methods: {
      ...mapMutations('hosts', ['toggleGuideDialog']),
      showCancelButton() {
        return this.hasHosts;
      },
      closeDialog() {
        this.autoShow = false;
        this.toggleGuideDialog(false);
      },
      onHostGuide() {
        this.$emit('host-guide:add-private-frontman-host');
        this.closeDialog();
      },
      onCancel() {
        this.closeDialog();
      },
    },
  };
</script>
