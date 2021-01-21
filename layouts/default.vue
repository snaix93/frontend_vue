<template>
  <v-app>
    <AppToolbar/>
    <v-content>
      <v-container fill-height>
        <nuxt/>
      </v-container>
      <AppFooter/>
    </v-content>
  </v-app>
</template>

<script>
  import AppToolbar from '@/components/App/AppToolbar.vue';
  import AppFooter from '@/components/App/AppFooter.vue';

  export default {
    components: {
      AppToolbar,
      AppFooter,
    },
  };
</script>
