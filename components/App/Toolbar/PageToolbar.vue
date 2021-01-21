<template>
  <v-toolbar
    class="v-toolbar--page qa-global-search"
    color="transparent"
    dark
    data-cy="pageToolbar"
    fixed
    flat
  >
    <template v-if="!searchMode">
      <slot/>
    </template>
    <v-toolbar-items
      class="align-center"
    >
      <v-divider
        v-if="!searchMode"
        class="mx-3"
        vertical
      />
      <v-avatar v-if="$vuetify.breakpoint.lgAndUp">
        <v-icon>
          search
        </v-icon>
      </v-avatar>
      <v-btn
        v-else
        :loading="!!$wait.is(waitKey)"
        :title="searchToggleButtonTitle | capitalize"
        icon
        @click="toggleSearchMode"
      >
        <v-icon>
          {{ searchMode ? 'close' : 'search' }}
        </v-icon>
      </v-btn>

      <GlobalSearchBar
        v-show="$vuetify.breakpoint.lgAndUp || searchMode"
        ref="globalSearchBar"
        style="min-width: 330px;"
      />
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
  import SettingsPanel from '@/components/Dashboard/DashboardSettingsFlyOut';
  import GlobalSearchBar from '@/components/App/Toolbar/GlobalSearchBar';

  export default {
    components: {
      GlobalSearchBar,
      SettingsPanel,
    },
    data() {
      return {
        searchMode: false,
        waitKey: 'toolbar.search',
      };
    },
    computed: {
      searchToggleButtonTitle() {
        return ! this.searchMode ? this.$t('button.quickAccessHost') : this.$t('phrase.close');
      }
    },
    methods: {
      toggleSearchMode() {
        if (this.$vuetify.breakpoint.mdAndDown || this.searchMode)
          this.searchMode = ! this.searchMode;
      },
    }
  };
</script>
