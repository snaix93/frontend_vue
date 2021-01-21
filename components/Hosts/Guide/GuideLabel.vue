<template>
  <span>
    <v-chip
      v-if="isRequired"
      class="mt-0"
      small
      color="grey darken-3"
      text-color="white"
      :disabled="true"
    >
      {{ $t('phrase.required') | capitalize }}
    </v-chip>
    <v-chip
      v-else
      class="mt-0"
      small
      color="grey lighten-2"
      text-color="black"
      :disabled="true"
    >
      {{ $t('phrase.optional') | capitalize }}
    </v-chip>
  </span>
</template>

<script>
  export default {
    props: {
      isRequired: {
        type: Boolean,
        required: true,
      },
    },
  };
</script>
