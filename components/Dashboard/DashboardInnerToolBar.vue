<template>
  <v-sheet
    :style="dimensions"
    class="px-4 d-flex"
    color="grey lighten-3"
    elevation="1"
    height="44"
    max-height="44"
    min-height="44"
    tile
  >
    <v-layout align-center full-height mx-1>
      <slot/>
    </v-layout>
  </v-sheet>
</template>

<script>
  export default {
    name: 'DashboardInnerToolBar',
    computed: {
      dimensions() {
        if (this.$vuetify.breakpoint.mdAndUp) {
          return { margin: '-24px -24px 20px' };
        }

        return { margin: '-16px -20px 20px' };
      }
    },
  };
</script>

<style lang="stylus">

</style>
