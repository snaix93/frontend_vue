<template>
  <v-layout justify-center wrap>
    <v-flex mt-4 lg10 sm10 xs12>
      <div class="pa-3">
        <h1 class="display-2 flex layout align-items-center qa-empty-dashboard ">
          <template v-if="isNewTeam">
            <span
              :class="{
                'animated shake animate__repeat-2' : !welcomeScreenShown
              }"
              class="mr-2"
              style="animation-delay:0.3s"
            >
              👋
            </span>
            {{ $t('dashboard.introHeading') }}
          </template>
          <template v-else>
            {{ $t('dashboard.emptyHeading') }}
          </template>
        </h1>
      </div>

      <transition
        :appear="!welcomeScreenShown"
        enter-active-class="animated fadeIn"
      >
        <div
          :style="animationDelay(1)"
          class="pa-3 pt-0"
        >
          <p
            :class="{
              'mb-5' : !isNewTeam,
              'mb-2' : isNewTeam
            }"
            class="subheading empty-dashboard-subheading mt-2"
          >
            {{ isNewTeam ? $t('dashboard.introSubheading') : $t('dashboard.emptySubheading') }}
          </p>

          <ol
            v-if="isNewTeam"
            class="subheading mb-5"
          >
            <li
              class="mb-1"
              v-html="$t('dashboard.introList.introListItem1')"
            >
            </li>
            <li
              class="mb-1"
              v-html="$t('dashboard.introList.introListItem2')"
            >
            </li>
            <li
              class="mb-1"
              v-html="$t('dashboard.introList.introListItem3')"
            >
            </li>
          </ol>
          <h2 class="headline">
            {{ $t('dashboard.introGuideHeading') }}
          </h2>
        </div>
      </transition>

      <transition
        :appear="!welcomeScreenShown"
        enter-active-class="animated fadeIn"
      >
        <Guide
          :style="animationDelay(2)"
          @host-guide:add-private-frontman-host="onHostGuide"
        />
      </transition>

      <transition
        :appear="!welcomeScreenShown"
        enter-active-class="animated fadeIn"
      >
        <div
          :style="animationDelay(3)"
          class="mt-4 pa-3"
        >
          <p>
            {{ $t('dashboard.introIfYouEncounter') }}
            <a @click="showSupportDialog">
              {{ $t('dashboard.introContactUs') }}
            </a>
            {{ $t('dashboard.introSoWeCanHelp') }}
          </p>
        </div>
      </transition>
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import Guide from '@/components/Hosts/Guide/Guide.vue';
  import hostMixin from '@/mixins/host';

  export default {
    components: {
      Guide,
    },
    mixins: [hostMixin],
    data() {
      return {
        welcomeScreenShown: false,
      };
    },
    computed: {
      ...mapState('dashboard', {
        welcomeScreenShownState: 'welcomeScreenShown',
      }),
      isNewTeam() {
        return this.$auth.team.isNewTeam;
      },
    },
    created() {
      this.welcomeScreenShown = ! this.isNewTeam ? true : this.welcomeScreenShownState;
    },
    mounted() {
      this.setWelcomeScreenShown();
    },
    methods: {
      ...mapMutations('dashboard', [
        'toggleWebCheckWizardDialog',
        'toggleHideHostDialog',
        'setWelcomeScreenShown'
      ]),
      ...mapMutations('app', [
        'showSupportDialog',
      ]),
      onHostGuide() {
        this.$router.push('/hosts/create?guide=private-frontman-host');
      },
      animationDelay(order) {
        const baseRate = 0.5;
        const growthRate = 0.2;
        if (this.welcomeScreenShown) {
          return 'animation-delay: 0s';
        }

        const delay = baseRate + (order * growthRate);
        return `animation-delay: ${delay}s`;
      }
    },
  };
</script>

<style lang="stylus" scoped>
  .empty-dashboard-subheading {
    font-weight: bold !important;
  }
</style>
