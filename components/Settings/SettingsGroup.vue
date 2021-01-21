<template>
  <v-flex
    :md6="!fillRow"
    xs12
  >
    <v-card class="fill-height">
      <v-card-title
        v-if="title"
        class="px-3 py-2 grey lighten-3 headline"
      >
        {{ title }}
      </v-card-title>
      <v-divider/>
      <v-card-text
        class="py-1 grey--text text--darken-2 position-relative"
      >
        <slot name="settings"/>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        required: false,
      },
      fillRow: {
        type: Boolean,
        required: false,
        default: false,
      }
    }
  };
</script>
