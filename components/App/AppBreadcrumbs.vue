<template>
  <v-breadcrumbs
    dark
    large
    class="pa-0"
    :items="items"
  >
    <template #item="props">
      <nuxt-link
        :to="props.item.href"
        replace
        class="v-breadcrumbs__item"
        :class="{ 'v-breadcrumbs__item--disabled font-weight-medium': props.item.disabled }"
        :disabled="props.item.disabled"
      >
        {{ props.item.text }}
      </nuxt-link>
    </template>
    <template #divider>
      <v-icon>
        chevron_right
      </v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script>
  export default {
    props: {
      items: {
        type: Array,
        required: true,
      },
    },
  };
</script>
