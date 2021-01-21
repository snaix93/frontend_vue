<template>
  <div class="guide">
    <v-card-text>
      <v-layout wrap>
        <Choice
          :active="isActive('server')"
          :title="$t('host.guide.agent.title')"
          class="qa-guide-server pr-2"
          @host-guide-choice-click="setSubGuide('server')"
        >
          <template #title-icons>
            <img
              alt="server"
              class="icon small mr-1"
              src="~/assets/icons/icons8-server.svg"
            >
            <img
              alt="windows"
              class="icon small mr-1"
              src="~/assets/icons/icons8-windows-xp-filled.svg"
            >
            <img
              alt="linux"
              class="icon small mr-0"
              src="~/assets/icons/icons8-linux-filled.svg"
            >
          </template>
          <template #description>
            {{ $t('host.guide.agent.description') }}
          </template>
          <template #footer>
            {{ $t('host.guide.agent.footer') }}
          </template>
        </Choice>
        <Choice
          :active="isActive('website')"
          :title="$t('host.guide.public.title')"
          class="qa-guide-website pr-2"
          @host-guide-choice-click="setSubGuide('website')"
        >
          <template #title-icons>
            <img
              alt="server"
              class="icon small"
              src="~/assets/icons/icons8-globe.svg"
            >
          </template>
          <template #description>
            {{ $t('host.guide.public.description') }}
          </template>
        </Choice>
        <Choice
          :active="isActive('networkDevice')"
          :title="$t('host.guide.frontman.title')"
          class="qa-guide-device pr-2"
          @host-guide-choice-click="showHostDialogWithNetworkGuide"
        >
          <template #title-icons>
            <img
              alt="server"
              class="icon small mr-1"
              src="~/assets/icons/icons8-bullet-camera.svg"
            >
            <img
              alt="server"
              class="icon small mr-1"
              src="~/assets/icons/icons8-wi-fi-router.svg"
            >
            <img
              alt="server"
              class="icon small mr-0"
              src="~/assets/icons/icons8-print.svg"
            >
          </template>
          <template #description>
            {{ $t('host.guide.frontman.description') }}
          </template>
          <template #footer>
            {{ $t('host.guide.frontman.footer') }}
          </template>
        </Choice>
      </v-layout>
    </v-card-text>
    <transition name="slide-y-transition">
      <v-card-text
        v-show="subGuide"
        :class="{
          'pb-0' : !subGuide
        }"
        class="pt-0"
      >
        <ServerSubGuide
          v-if="subGuide === 'server'"
          @on-cancel="onCancelSubGuide"
        />
        <WebsiteSubGuide
          v-if="subGuide === 'website'"
          @on-cancel="onCancelSubGuide"
        />
      </v-card-text>
    </transition>
  </div>
</template>

<script>
  import AppWait from '@/components/App/AppWait';
  import Choice from '@/components/Hosts/Guide/Choice';
  import ServerSubGuide from '@/components/Hosts/Guide/SubGuides/Server';
  import WebsiteSubGuide from '@/components/Hosts/Guide/SubGuides/Website';
  import appMixins from '@/mixins/app';

  export default {
    components: {
      AppWait,
      Choice,
      ServerSubGuide,
      WebsiteSubGuide,
    },
    mixins: [appMixins],
    props: {
      hasHosts: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data() {
      return {
        autoShow: false,
        subGuide: null,
      };
    },
    async mounted() {
      setTimeout(() => {
        this.autoShow = this.$userSettings.get('autoShow.hostGuide');
      }, 300);
    },
    methods: {
      setSubGuide(key) {
        this.subGuide = key;
      },
      showCancelButton() {
        return this.hasHosts || this.subGuide;
      },
      showHostDialogWithNetworkGuide() {
        this.$emit('host-guide:add-private-frontman-host');
      },
      isActive(subGuide) {
        if (this.subGuide === subGuide || ! this.subGuide) return true;
        return false;
      },
      onCancelSubGuide() {
        this.subGuide = null;
      }
    },
  };
</script>

<style lang="stylus" scoped>
  .icons
    .icon
      height: 38px
      width: 38px

      &.small
        height: 20px;
        width: 20px;

  .private-host--option
    opacity: 0.4
    transition: opacity 0.5s ease-in

    &.focused
      opacity: 1
</style>
