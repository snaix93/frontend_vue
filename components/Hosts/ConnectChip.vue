<template>
  <div class="connect-chip">
    <v-chip
      v-if="connectType === 'private'"
      :disabled="true"
      class="mt-0"
      color="green"
      small
      text-color="white"
    >
      Private
    </v-chip>
    <v-chip
      v-else-if="connectType === 'public'"
      :disabled="true"
      class="mt-0"
      color="green"
      small
      text-color="white"
    >
      Public
    </v-chip>
    <v-chip
      v-else-if="connectType === 'invalid'"
      :disabled="true"
      class="mt-0"
      color="error"
      small
      text-color="white"
    >
      Invalid
    </v-chip>
    <v-progress-circular
      v-else-if="loading"
      :size="20"
      color="primary"
      indeterminate
    />
  </div>
</template>
<script>
  export default {
    props: {
      connectType: null,
      loading: {
        type: Boolean,
        default: false,
        required: false,
      },
    },
  }
</script>
