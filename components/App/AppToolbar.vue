<template>
  <v-toolbar
    :class="{'secondary v-toolbar--admin': admin}"
    :dark="admin"
    app
    clipped-left
    color="white"
    fixed
  >
    <v-layout
      align-center
      fill-height
      row
    >
      <v-toolbar-items class="white">
        <v-toolbar-side-icon
          v-if="admin && !TVMode"
          class="hidden-md-and-up text--primary"
          @click.stop="toggleAppDrawer"
        />
        <logo
          :class="{'ml-4': admin}"
          :link="logoLinkTarget"
        />
      </v-toolbar-items>

      <v-spacer/>
      <slot name='right-side'/>
    </v-layout>
  </v-toolbar>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import Logo from '@/components/App/Logo.vue';

  export default {
    components: {
      Logo,
    },
    props: {
      admin: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data() {
      return {
        logoTarget: {
          to: '/dashboard',
          type: 'nuxt',
        },
      };
    },
    computed: {
      ...mapState('app', ['appDrawer', 'appDrawerMini', 'currentRoute']),
      ...mapState('app', { isVisible: 'appToolbar' }),
      ...mapState('dashboard', ['TVMode']),
      drawerMini() {
        return this.appDrawerMini;
      },
      isRegisterPage() {
        return this.currentRoute.includes('/register');
      },
      isAuthPage() {
        return this.currentRoute.includes('/auth');
      },
      isPasswordPage() {
        return (
          this.currentRoute.includes('/password/forgot')
          || this.currentRoute.includes('/password/reset')
        );
      },
      wwwBaseUrl() {
        return process.env.WWW_BASE_PATH;
      },
      logoLinkTarget() {
        const target = this.logoTarget;
        if (this.isPasswordPage) {
          target.to = '/auth';
        }
        if (this.isRegisterPage || this.isAuthPage) {
          target.to = this.wwwBaseUrl;
          target.type = 'href';
        }
        return target;
      },
    },
    methods: {
      ...mapMutations('app', ['toggleAppDrawer']),
    },
  };
</script>

<style lang="stylus" scoped>
  .btn-register,
  .btn-login
    width: 78px
</style>
