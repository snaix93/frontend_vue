<template>
  <v-icon :color="color">
    account_circle
  </v-icon>
</template>

<script>
  export default {
    props: {
      status: {
        type: String,
        default: () => '',
      },
    },
    computed: {
      color() {
        let color = 'secondary';

        if (this.status.toLowerCase() === 'invited') {
          color = 'orange';
        }

        return color;
      },
    },
  };
</script>
