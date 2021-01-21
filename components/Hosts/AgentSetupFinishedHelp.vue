<template>
  <div>
    <v-dialog
      v-model="showHelpContent"
      lazy
      persistent
      hide-overlay
      :content-class="$vuetify.breakpoint.smAndUp ? 'agent-setup-finished-dialog' : ''"
      width="420"
    >
      <v-card>
        <v-card-text class="text-xs-center">
          <v-avatar>
            <SuccessIcon
              width="35px"
              height="35px"
            />
          </v-avatar>
          <div class="mt-2 subheading font-weight-medium">
            {{ $t('message.success.agentSetupFinishedTitle') }}
          </div>
          <div class="body-1">
            {{ $t('message.success.agentSetupFinishedSubTitle') }}
          </div>
          <v-layout
            column
            justify-center
            align-center
          >
            <v-checkbox
              v-model="dontShowAgain"
              :label="$t('button.dontShowAgain')"
              hide-details
              color="secondary"
              class="mb-2"
            />
            <v-btn
              color="success"
              @click="onCloseHelp"
            >
              {{ $t('button.close') }}
            </v-btn>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>

    <b-popover
      v-if="$vuetify.breakpoint.smAndUp && showHelpContent"
      placement="bottom"
      container="#app"
      :show.sync="showHelpContent"
      boundary="viewport"
      target="host-tabs"
    >
      <v-card
        flat
        dark
        color="transparent"
        style="margin-left: -90px;"
      >
        <v-card-text class="body-2 text-xs-right pa-0">
          {{ $t('host.cagentSetupFinishedHelpHint1') }} <v-icon large>
            arrow_upward
          </v-icon>
        </v-card-text>
      </v-card>
    </b-popover>

    <b-popover
      v-if="$vuetify.breakpoint.mdAndUp && showHelpContent"
      placement="left"
      container="#app"
      :show.sync="showHelpContent"
      boundary="viewport"
      target="menu-item-1"
      offset="60"
    >
      <v-card
        flat
        dark
        color="transparent"
        style="margin-left: -50px"
      >
        <v-card-text class="body-2 pa-0">
          <v-icon large>
            arrow_upward
          </v-icon>
          <span class="body-2">{{ $t('host.cagentSetupFinishedHelpHint2') }}</span>
          <i18n
            path="host.cagentSetupFinishedHelpHint3"
            tag="span"
            class="caption"
          >
            <v-icon>bar_chart</v-icon>
          </i18n>
        </v-card-text>
      </v-card>
    </b-popover>
  </div>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import { BPopover } from 'bootstrap-vue';
  import SuccessIcon from '@/components/App/SuccessIcon';

  export default {
    components: {
      SuccessIcon,
      'b-popover': BPopover,
    },
    data() {
      return {
        dontShowAgain: false,
      };
    },
    computed: {
      ...mapState('hosts', ['agentSetupHelpOverlay']),
      showHelpContent() {
        return this.agentSetupHelpOverlay && this.$userSettings.get('autoShow.agentSetupHelp');
      },
    },
    watch: {
      showHelpContent(val) {
        if (val) {
          this.showHelpOverlay();
        } else {
          this.hideHelpOverlay();
        }
      },
    },
    methods: {
      ...mapMutations('hosts', ['toggleAgentSetupHelpOverlay']),
      ...mapMutations('app', ['showAppOverlay', 'hideAppOverlay']),
      onCloseHelp() {
        this.toggleAgentSetupHelpOverlay();
        if (this.dontShowAgain) {
          this.$userSettings.set('autoShow.agentSetupHelp', false).save();
        }
      },
      showHelpOverlay() {
        document.querySelector('#app').classList.add('agent-setup-finished');
        this.showAppOverlay();
      },
      hideHelpOverlay() {
        document.querySelector('#app').classList.remove('agent-setup-finished');
        this.hideAppOverlay();
      },
    },
  };
</script>
<style lang="stylus">
  .agent-setup-finished-dialog
    margin-top: 150px
  .agent-setup-finished
    .v-navigation-drawer
      pointer-events: none
      z-index: 4
      max-height: none !important
      .nav-entry-hosts
        animation: boxShadow .1s .1s ease-in 1 forwards
    .v-toolbar--page
      pointer-events: none
      z-index: 4 !important
      .v-breadcrumbs
      .v-tabs__slider,
      .v-tabs__item
        opacity: 0.4
      #hostTabsLatestData
        .v-tabs__item
          opacity: 1
    .popover-body
      background: transparent
      box-shadow: none
      &::before
        display: none

  @keyframes boxShadow
    0%
      box-shadow: none
    100%
      box-shadow: 0 0 0 5000px rgba(0, 0, 0, .75)
</style>
