<template>
  <tr data-qa="dashboard:list-item">
    <td
      class="grey lighten-2 dashboard-list-border-right"
      style="max-width: 180px"
    >
      <slot name="title"/>
    </td>
    <td
      class="pr-1"
    >
      <v-layout
        align-center
        justify-space-between
      >
        <v-flex lg5 md6 xl4>
          <slot name="badges"/>
        </v-flex>
        <v-flex>
          <slot name="checks"/>
        </v-flex>
        <v-flex shrink>
          <slot name="buttons"/>
        </v-flex>
      </v-layout>
    </td>
  </tr>
</template>

<script>
  export default {};
</script>

<style lang="stylus" scoped>
  .dashboard-list-border-right
    box-shadow: inset -2px 0 0 0 #3d4a63;
</style>
