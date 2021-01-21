<template>
  <v-app>
    <AppToolbar :admin="false">
      <template #right-side>
        <v-btn
          :loading="$wait.is($WAIT_FOR.AUTH.LOGOUT)"
          flat
          @click="logout"
        >
          logout
        </v-btn>
      </template>
    </AppToolbar>
    <v-content :class="{ 'drawer-open': drawer, 'drawer-mini': drawerMini }">
      <v-container
        fill-height
        grid-list-md
      >
        <nuxt/>
      </v-container>
      <AppFooter/>
    </v-content>
  </v-app>
</template>

<script>
  import { mapState } from 'vuex';
  import AppToolbar from '@/components/App/AppToolbar.vue';
  import AppFooter from '@/components/App/AppFooter.vue';
  import useAuth from '@/mixins/useAuth';

  export default {
    middleware: ['auth', 'initAuthedUser', 'route'],
    mixins: [useAuth],
    components: {
      AppToolbar,
      AppFooter,
    },
    computed: {
      ...mapState('app', {
        drawer: 'appDrawer',
        drawerMini: 'appDrawerMini',
      }),
    },
    methods: {
      async logout() {
        await this.useAuth_logout();
      }
    },
  };
</script>
