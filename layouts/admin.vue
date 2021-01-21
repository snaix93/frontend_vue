<template>
  <v-app>
    <AppOverlay/>
    <AppBlanket/>
    <AppNavigationDrawer/>
    <AppToolbar admin/>
    <v-content :class="{
      'tv-mode': TVMode,
      'drawer-open': appDrawer,
      'drawer-mini': appDrawerMini
    }">
      <v-container
        class="app-container"
        fill-height
        grid-list-md
      >
        <FixedBottomBanner v-if="$auth.user.isAdmin() && !$auth.user.emailVerified">
          <ResendVerificationEmailAlert>
            {{ $t('auth.emailNotVerified.body') }}
          </ResendVerificationEmailAlert>
        </FixedBottomBanner>
        <nuxt/>
      </v-container>
      <AppFooter/>
      <AppWait :wait="$wait.is(globalWait)"/>
    </v-content>
    <AppSnackBarQueue/>
    <SupportDialog/>
    <EmailVerificationReminderDialog
      v-if="$auth.user.isAdmin() && ! $auth.user.emailVerified"
    />
  </v-app>
</template>

<script>
  import { mapState } from 'vuex';
  import Visibility from 'visibilityjs';
  import ResendVerificationEmailAlert from '@/components/Auth/ResendVerificationEmailAlert';
  import AppNavigationDrawer from '@/components/App/AppNavigationDrawer.vue';
  import FixedBottomBanner from '@/components/App/FixedBottomBanner';
  import AppSnackBarQueue from '@/components/App/AppSnackBarQueue';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import SupportDialog from '@/components/App/SupportDialog';
  import AppToolbar from '@/components/App/AppToolbar.vue';
  import AppFooter from '@/components/App/AppFooter.vue';
  import AppOverlay from '@/components/App/AppOverlay';
  import AppBlanket from '@/components/App/AppBlanket';
  import AppWait from '@/components/App/AppWait';
  import planMixins from '@/mixins/plan';
  import EmailVerificationReminderDialog from '~/components/Auth/EmailVerificationReminderDialog';

  let visibilityListener;
  export default {
    middleware: ['auth', 'setLocaleByCookie', 'initAuthedUser', 'route'],
    components: {
      EmailVerificationReminderDialog,
      ResendVerificationEmailAlert,
      AppNavigationDrawer,
      FixedBottomBanner,
      AppSnackBarQueue,
      SupportDialog,
      AppOverlay,
      AppToolbar,
      AppBlanket,
      AppFooter,
      AppWait,
    },
    mixins: [planMixins, useBackendValidation],
    computed: {
      ...mapState('dashboard', ['TVMode']),
      ...mapState('app', ['appDrawer', 'appToolbar', 'appFooter', 'appDrawerMini']),
      globalWait() {
        // add 'wait keys' here to trigger a loading overlay on the whole main screen (exc. nav)
        return [
          'checkout.init',
          this.$WAIT_FOR.AUTH.LOGOUT,
          this.$WAIT_FOR.USER.UPDATE_LANGUAGE,
        ];
      },
    },
    created() {
      this.$sentry.configureScope(scope => {
        scope.setUser({
          id: this.$auth.user.id,
          email: this.$auth.user.email,
        });
        scope.setContext('team', {
          id: this.$auth.team.id,
          isNewTeam: this.$auth.team.isNewTeam,
          onboarded: this.$auth.team.onboarded,
          timezone: this.$auth.team.timezone,
          plan: this.$auth.team.plan,
          hostCount: this.$auth.team?.counts?.hosts ?? null,
          createdAt: this.$auth.team.dates.createdAt.readable,
        });
      });

      this.$router.afterEach((_to, _from) => {
        this.useBackendValidation_reset();
      });
    },
    mounted() {
      visibilityListener = Visibility.change((_e, _state) => {
        this.onVisibilityChange();
      });
    },
    beforeDestroy() {
      Visibility.unbind(visibilityListener);
      this.$bus.$off('visibility-change:visible');
      this.$bus.$off('visibility-change:hidden');
    },
    methods: {
      async onVisibilityChange() {
        if (! Visibility.hidden()) {
          this.$bus.$emit('visibility-change:visible');
          await this.plan_checkForPlanChanges();
          await this.checkForVerifiedEmail();
        } else {
          this.$bus.$emit('visibility-change:hidden');
        }
      },
      async checkForVerifiedEmail() {
        if (this.$auth.user.emailVerified) return;
        await this.$hardRefreshUser();
      }
    }
  };
</script>

<style lang="stylus" scoped>
  &.tv-mode
    max-width: 100% !important
</style>
