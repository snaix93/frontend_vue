<template>
  <v-toolbar-items>
    <v-menu
      v-model="showSettingsMenu"
      :close-on-content-click="false"
      :nudge-bottom="50"
      :nudge-right="50"
      :z-index="20000"
      left
      offset-x
      transition="slide-y-transition"
    >
      <template #activator="{ on }">
        <v-layout
          :class="{ 'is-active': showSettingsMenu }"
          align-center
          justify-center
        >
          <v-flex mt-1 shrink>
            <v-btn
              v-on="on"
              dark
              data-cy="settingsButton"
              icon
              large
            >
              <v-icon v-if="!showSettingsMenu" :size="32" color="grey darken-2">
                settings
              </v-icon>
              <v-icon v-else :size="32" color="grey darken-2">
                close
              </v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </template>
      <v-card>
        <v-list subheader two-line>
          <v-subheader class="black--text">
            {{ $t('app.settingsPanel.dashboardSettings.heading') | titlecase }}
          </v-subheader>
<!--          <v-list-tile-->
<!--            class="qa-dashsettings-chart"-->
<!--            @click=""-->
<!--          >-->
<!--            <v-list-tile-action>-->
<!--              <v-switch-->
<!--                v-model="showMiniChartsSetting"-->
<!--                color="secondary"-->
<!--              />-->
<!--            </v-list-tile-action>-->
<!--            <v-list-tile-content @click.prevent="showMiniChartsSetting = !showMiniChartsSetting">-->
<!--              <v-list-tile-title>-->
<!--                {{ $t('app.settingsPanel.dashboardSettings.miniCharts.title') | capitalize }}-->
<!--              </v-list-tile-title>-->
<!--              <v-list-tile-sub-title>-->
<!--                {{ $t('app.settingsPanel.dashboardSettings.miniCharts.subtitle') }}-->
<!--              </v-list-tile-sub-title>-->
<!--            </v-list-tile-content>-->
<!--          </v-list-tile>-->
          <v-list-tile
            class="qa-dashsettings-issues"
            @click=""
          >
            <v-list-tile-action>
              <v-switch
                v-model="showHostsWithIssuesSetting"
                :disabled="$wait.is($WAIT_FOR.HOST.ALL)"
                color="secondary"
              />
            </v-list-tile-action>
            <v-list-tile-content @click.prevent="showHostsWithIssuesSetting = !showHostsWithIssuesSetting">
              <v-list-tile-title>
                {{ $t('app.settingsPanel.dashboardSettings.hideGreenHosts.title') | capitalize }}
              </v-list-tile-title>
              <v-list-tile-sub-title>
                {{ $t('app.settingsPanel.dashboardSettings.hideGreenHosts.subtitle') }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
            class="qa-dashsettings-refresh"
            @click=""
          >
            <v-list-tile-action>
              <v-switch
                v-model="autoRefreshSetting"
                color="secondary"
              />
            </v-list-tile-action>
            <v-list-tile-content @click.prevent="tileContentClickAutoRefresh">
              <v-list-tile-title>
                {{ $t('app.settingsPanel.dashboardSettings.backgroundRefresh.title') | titlecase }}
              </v-list-tile-title>
              <v-list-tile-sub-title
                v-if="autoRefreshSetting"
                class="px-3"
                data-cy="autoRefreshRateSlider"
              >
                <v-slider
                  v-model="autoRefreshRateSetting"
                  :max="3"
                  :min="0"
                  :tick-labels="['30s','60s','90s','120s']"
                  color="secondary"
                  data-cy="slider"
                  step="1"
                  tick-size="2"
                  ticks="always"
                  track-color="secondary"
                />
              </v-list-tile-sub-title>
              <v-list-tile-sub-title v-else>
                {{ $t('app.settingsPanel.dashboardSettings.backgroundRefresh.title') }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-menu>
  </v-toolbar-items>
</template>

<script>
  import { debounce } from 'lodash-es';
  import { mapActions, mapState } from 'vuex';

  export default {
    data() {
      return {
        showSettingsMenu: false,
      };
    },
    computed: {
      ...mapState('appSettings', ['showMiniCharts']),
      showMiniChartsSetting: {
        get() {
          return this.showMiniCharts;
        },
        set(value) {
          this.toggleMiniCharts(value);
        },
      },
      showHostsWithIssuesSetting: {
        get() {
          return this.$userSettings.get('dashboard.showHostsWithIssuesOnly');
        },
        set: debounce(function (value) {
          this.$userSettings.set('dashboard.showHostsWithIssuesOnly', value)
              .save();
        }, 500, {
          'leading': true,
          'trailing': true
        }),
      },
      autoRefreshSetting: {
        get() {
          return this.$userSettings.get('dashboard.shouldAutoRefresh');
        },
        set: debounce(function (value) {
          this.$userSettings.set('dashboard.shouldAutoRefresh', value)
              .save();
        }, 500, {
          'leading': true,
          'trailing': true
        }),
      },
      autoRefreshRateSetting: {
        get() {
          return [30, 60, 90, 120].indexOf(
            this.$userSettings.get('dashboard.refreshRate')
          );
        },
        set: debounce(function (value) {
          this.$userSettings
              .set('dashboard.refreshRate', [30, 60, 90, 120][value])
              .save();
        }, 500, {
          'leading': true,
          'trailing': true
        }),
      },
    },
    methods: {
      ...mapActions('appSettings', ['toggleMiniCharts']),
      tileContentClickAutoRefresh() {
        if (! this.autoRefreshSetting) {
          this.autoRefreshSetting = true;
        }
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .v-input--slider
    margin-top: 0 !important
</style>
