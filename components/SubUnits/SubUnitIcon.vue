<template>
  <div>
    <v-icon
      color="primary"
      small
    >
      perm_contact_calendar
    </v-icon>
    {{ shortId }}
  </div>
</template>

<script>
  export default {
    props: {
      shortId: {
        type: String,
        required: true,
      }
    }
  };
</script>
