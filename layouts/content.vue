<template>
  <v-app>
    <AppToolbar/>
    <v-content>
      <nuxt/>
    </v-content>
    <AppFooter/>
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
