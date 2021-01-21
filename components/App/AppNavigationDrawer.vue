<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="drawerMini"
      app
      clipped
      fixed
      mobile-break-point="960"
      width="240"
    >
      <v-list dense>
        <v-list-tile id="menu-item-account">
          <v-list-tile-action>
            <v-icon>account_circle</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title data-cy="usernameDisplay">
              {{ user_username }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <b-popover
          v-if="drawerMini"
          boundary="viewport"
          container="#app"
          placement="right"
          target="menu-item-account"
          triggers="hover"
        >
          <div v-html="user_username"/>
        </b-popover>
        <v-divider/>
        <template v-for="(item, i) in items">
          <v-divider
            v-if="itemHasSubs(item)"
            :key="'divider-top-' + i"
          />
          <v-list-tile
            :id="'menu-item-' + i"
            :key="'menu-item-' + i"
            :class="['qa-' + item.key, itemClass(item), 'nav-entry', 'nav-entry-' + item.key]"
            :data-cy="item.key"
            :disabled="isItemDisabled(item)"
            :inactive="itemHasSubs(item)"
            :to="item.action ? undefined : item.to"
            exact
            nuxt
            @click="item.action ? item.action() : undefined"
          >
            <v-list-tile-action v-if="item.icon">
              <v-icon
                :class="item.highlightClass"
                v-html="item.icon"
              />
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title
                :class="{
                  'text-muted text-uppercase': itemHasSubs(item)
                }"
              >
                {{ item.title | capitalize }}
              </v-list-tile-title>
            </v-list-tile-content>
            <AppChip
              v-if="!drawerMini && item.showAppChip"
              v-wait:hidden="$WAIT_FOR.USER.ALL"
              class="ma-0"
              color="warning darken-1"
              outline
              small
              text-color="warning darken-1"
            >
              {{ item.appChip }}
            </AppChip>
          </v-list-tile>
          <v-list-tile v-if="!drawerMini && !!item.showButton">
            <v-btn
              :class="{
                'animated tada infinite slower' : item.buttonTada
              }"
              block
              class="ma-0 ml-3 mb-1 white--text"
              color="highlight"
              small
              :disabled="item.buttonWait"
              :loading="item.buttonWait"
              @click="item.buttonAction"
            >
              <v-icon
                v-if="item.buttonIcon"
                left
              >
                {{ item.buttonIcon }}
              </v-icon>
              {{ item.button }}
            </v-btn>
          </v-list-tile>
          <template v-if="itemHasSubs(item)">
            <template v-for="(sub, j) in item.subs">
              <v-list-tile
                :id="'menu-sub-item-' + i + '-' + j"
                :key="'menu-sub-item-' + i + '-' + j"
                :class="[
                  'qa-' + item.key + '-' + sub.key,
                  itemClass(sub),
                  'nav-entry--sub'
                ]"
                :data-cy="sub.key"
                :disabled="isItemDisabled(sub)"
                :to="sub.action ? undefined : sub.to"
                exact
                @click="sub.action ? sub.action() : undefined"
              >
                <v-list-tile-action>
                  <v-icon
                    :class="sub.highlightClass"
                    v-html="sub.icon"
                  />
                </v-list-tile-action>
                <v-list-tile-content v-if="!drawerMini">
                  <v-list-tile-title>
                    {{ sub.title | capitalize }}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <b-popover
                v-if="sub.hasPopover || drawerMini"
                :key="'popover-sub-' + i + '-' + j"
                :target="'menu-sub-item-' + i + '-' + j"
                boundary="viewport"
                container="#app"
                placement="right"
                triggers="hover"
              >
                <div
                  v-if="sub.hasPopover"
                  v-html="fetchTooltip(sub.tooltipKey)"
                />
                <div v-else-if="drawerMini">
                  {{ sub.title | capitalize }}
                </div>
              </b-popover>
            </template>
          </template>
          <b-popover
            v-if="item.hasPopover || drawerMini"
            :key="'popover-' + i"
            :target="'menu-item-' + i"
            boundary="viewport"
            container="#app"
            placement="right"
            triggers="hover"
          >
            <div
              v-if="item.hasPopover"
              v-html="fetchTooltip(item.tooltipKey)"
            />
            <div v-else-if="drawerMini">
              {{ item.title | capitalize }}
            </div>
          </b-popover>

          <v-divider
            v-if="itemHasSubs(item)"
            :key="'divider-bottom-' + i"
          />
        </template>
        <v-divider/>
        <v-list-tile
          id="menu-item-minmax"
          @click.stop="toggleAppDrawerMini()"
        >
          <v-list-tile-action>
            <v-icon>{{ miniVariantIcon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="text-muted">
              {{ miniVariantLabel | capitalize }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <b-popover
          v-if="drawerMini"
          boundary="viewport"
          container="#app"
          placement="right"
          target="menu-item-minmax"
          triggers="hover"
        >
          <div>{{ miniVariantLabel | capitalize }}</div>
        </b-popover>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
  import { isEmpty } from 'lodash-es';
  import { mapMutations, mapState } from 'vuex';
  import { BPopover } from 'bootstrap-vue';

  import AppChip from '@/components/App/AppChip';

  import appMixins from '@/mixins/app';
  import userMixins from '@/mixins/user';
  import useAuth from '@/mixins/useAuth';
  import useCheckout from "@/mixins/useCheckout";

  // noinspection JSAnnotator
  export default {
    components: {
      AppChip,
      'b-popover': BPopover
    },
    mixins: [
      appMixins,
      userMixins,
      useAuth,
      useCheckout
    ],
    data() {
      return {
        miniVariant: false,
      };
    },
    computed: {
      ...mapState('app', ['appDrawer', 'appDrawerMini', 'currentRoute']),
      ...mapState('tooltips', ['NAV_HOSTS', 'NAV_RECIPIENTS', 'NAV_RULES', 'NAV_TEAM']),
      ...mapState('user', ['checkoutData']),
      userPlan() {
        if (this.$auth.user.onTrialOrFrozenPlan()) {
          return this.$tc('settings.plans.trial');
        }
        return this.$tc('settings.plans.' + this.$auth.team.plan);
      },
      unformattedItems() {
        return [
          {
            key: 'dashboard',
            icon: 'apps',
            title: this.$t('app.drawer.dashboard'),
            to: '/dashboard/hosts',
            activeWhileReadOnly: true,
          },
          {
            key: 'hosts',
            icon: 'storage',
            title: this.$t('app.drawer.hosts'),
            to: '/hosts',
            tooltipKey: 'NAV_HOSTS',
            hasPopover: true,
            activeWhileReadOnly: true,
          },
          {
            key: 'events',
            icon: 'offline_bolt',
            title: this.$t('app.drawer.events'),
            to: '/events',
            // tooltipKey: 'NAV_EVENTS',
            // hasPopover: true,
            activeWhileReadOnly: true,
          },
          {
            key: 'reports',
            icon: 'calendar_today',
            title: this.$t('app.drawer.reports'),
            to: '/reports',
            activeWhileReadOnly: true,
          },
          {
            key: 'frontmen',
            icon: 'public',
            title: this.$t('app.drawer.frontmen'),
            to: '/frontmen',
          },
          {
            key: 'alerting',
            icon: '',
            title: this.$t('app.drawer.alerting'),
            subs: [
              {
                key: 'rules',
                icon: 'flag',
                title: this.$t('app.drawer.rules'),
                to: '/rules',
                tooltipKey: 'NAV_RULES',
                hasPopover: true,
              },
              {
                key: 'recipients',
                icon: 'send',
                title: this.$t('app.drawer.recipients'),
                to: '/recipients',
                tooltipKey: 'NAV_RECIPIENTS',
                hasPopover: true,
              },
            ],
          },
          {
            key: 'team',
            icon: 'group',
            title: this.$t('app.drawer.team'),
            to: '/team',
            tooltipKey: 'NAV_TEAM',
            adminOnly: true,
            hasPopover: true,
          },
          {
            key: 'subUnits',
            icon: 'perm_contact_calendar',
            title: this.$t('app.drawer.subUnits'),
            to: '/sub-units',
            hasPopover: false,
            subUnitManagementEnabled: true,
          },
          {
            key: 'settings',
            icon: 'settings',
            title: this.$t('app.drawer.settings'),
            to: '/settings',
            activeOnFrozenPlan: true,
            activeWhileReadOnly: true,
          },
          {
            key: 'teamActivities',
            icon: 'recent_actors',
            title: this.$t('app.drawer.teamActivities'),
            to: '/activity/team',
            showTeamActivitiesOnly: true,
          },
          {
            key: 'activity',
            icon: '',
            title: this.$t('app.drawer.activity'),
            adminOnly: true,
            showAllActivities: true,
            subs: [
              {
                key: 'hostActivities',
                icon: 'dvr',
                title: this.$t('app.drawer.hostActivities'),
                to: '/activity/hosts',
              },
              {
                key: 'teamActivities',
                icon: 'recent_actors',
                title: this.$t('app.drawer.teamActivities'),
                to: '/activity/team',
              },
            ],
          },
          {
            key: 'statusPages',
            icon: 'fas fa-file-medical-alt',
            title: this.$t('app.drawer.statusPages'),
            to: '/status-pages',
            // adminOnly: true,
            // activeWhileReadOnly: true,
          },
          {
            key: 'api',
            icon: 'code',
            title: this.$t('app.drawer.api'),
            to: '/api',
            adminOnly: true,
          },
          {
            key: 'learnAndSupport',
            icon: 'live_help',
            title: this.$t('app.drawer.learnAndSupport'),
            to: '/learn',
            activeWhileReadOnly: true,
          },
          {
            key: 'upgrade',
            icon: 'star',
            highlightClass: 'highlight--text',
            title: this.userPlan,
            action: this.onUpgrade,

            showAppChip: this.$auth.user.onTrial(),
            appChip: this.user_trialRemainingPhrase,

            showButton: this.$auth.user.onTrialOrFrozenPlan(),
            button: this.$t('app.drawer.upgrade'),
            buttonIcon: 'upgrade',
            buttonAction: this.onUpgrade,
            buttonWait: this.$wait.is(this.$WAIT_FOR.USER.CHECKOUT_DATA),
            buttonTada: this.user_trialRemaining < 5 && !this.$wait.is(this.$WAIT_FOR.USER.CHECKOUT_DATA),

            activeOnFrozenPlan: true,
            hiddenOnPayedPlans: true,
          },
          {
            key: 'logOut',
            icon: 'exit_to_app',
            title: this.$t('app.drawer.logOut'),
            action: this.onLogout,
            activeOnFrozenPlan: true,
            activeWhileReadOnly: true,
            activeWhileOnBoarding: true,
          },
        ];
      },
      drawer: {
        get() {
          return this.appDrawer;
        },
        set(state) {
          if (state !== this.appDrawer) {
            this.toggleAppDrawer();
          }
        },
      },
      drawerMini() {
        return this.appDrawerMini;
      },
      miniVariantIcon() {
        return this.drawerMini ? 'chevron_right' : 'chevron_left';
      },
      miniVariantLabel() {
        return this.drawerMini
               ? this.$t('app.drawer.maximize')
               : this.$t('app.drawer.minimize');
      },
      items() {
        let items = this.unformattedItems;

        items = items.filter((item) => {
          if (item.devOnly && this.isProdEnv) return false;

          if (item.adminOnly && ! this.$auth.user.isAdmin()) return false;

          if (! item.activeWhileOnBoarding && ! this.$auth.user.hasCompletedTeamSettings()) return false;

          if (! item.activeWhileReadOnly && this.$auth.user.isReadOnly()) return false;

          if (item.hiddenOnPayedPlans
              && (this.$auth.user.onProPlan() || this.$auth.user.onPaygPlan())) {
            return false;
          }

          if (item.subUnitManagementEnabled && ! this.$teamSettings.get('subUnitManagementEnabled')) return false;

          if (item.showAllActivities
              && this.$auth.user.onFreePlan()) {
            return false;
          }

          if (item.showTeamActivitiesOnly
              && ! this.$auth.user.onFreePlan()) {
            return false;
          }

          return true;
        });

        return items;
      },
    },
    async beforeMount() {
      await Promise.all([
        this.$store.dispatch('tooltips/NAV_HOSTS'),
        this.$store.dispatch('tooltips/NAV_RECIPIENTS'),
        this.$store.dispatch('tooltips/NAV_RULES'),
        this.$store.dispatch('tooltips/NAV_TEAM'),
      ]);
    },
    methods: {
      ...mapMutations('app', ['toggleAppDrawer', 'toggleAppDrawerMini']),
      itemClass(item) {
        return {
          'nav--active': this.currentRoute.startsWith(item.to),
          'nav--inactive': this.itemHasSubs(item),
          hidden: this.itemHasSubs(item) && this.drawerMini,
        };
      },
      fetchTooltip(tooltipKey) {
        return this[tooltipKey];
      },
      itemHasSubs(item) {
        return item.subs && item.subs.length > 0;
      },
      async onLogout() {
        this.useAuth_logout();
      },
      onUpgrade() {
        if(isEmpty(this.checkoutData)) {
          this.useCheckout_getHandoverAndUpgrade(this.$auth.user);
        } else {
          this.useCheckout_open(this.checkoutData.handover.baseUrl, 'upgrade')
        }
      },
      isItemDisabled(item) {
        if (item.action) return false;

        if (! item.activeOnFrozenPlan) return this.$auth.user.onFrozenPlan();

        return ! this.$auth.user.hasCompletedTeamSettings();
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .hidden
    display: none
</style>
