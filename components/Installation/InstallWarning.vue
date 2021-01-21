<template>
  <v-layout
    row
    align-center
  >
    <v-flex
      shrink
      mr-2
    >
      <v-icon color="error">
        error
      </v-icon>
    </v-flex>
    <v-flex>
      <template v-if="type === 'cagent'">
        {{ $t('install.frontman.installWarning', { location }) }}
      </template>
      <template v-else>
        {{ $t('install.cagent.installWarning', { host: location }) }}
      </template>
    </v-flex>
  </v-layout>
</template>
<script>
  export default {
    props: {
      location: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: false,
        default: 'cagent',
      },
    },
  };
</script>
