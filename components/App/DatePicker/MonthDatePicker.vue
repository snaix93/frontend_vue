<template>
  <v-layout>
    <v-flex>
      <v-menu
        ref="menu"
        :nudge-right="40"
        lazy
        transition="scale-transition"
        offset-y
        full-width
        max-width="290px"
        min-width="290px"
      >
        <v-text-field
          slot="activator"
          v-model="month"
          prepend-icon="event"
          readonly
        />
        <v-date-picker
          v-model="month"
          :allowed-dates="allowedDates"
          type="month"
          no-title
        />
      </v-menu>
    </v-flex>
  </v-layout>
</template>

<script>

export default {
  props: {
    value: {
      required: true,
    },
    allowedDates: {
      type: Function,
      required: false,
    }
  },
  data() {
    return {
      date: null,
    }
  },
  computed: {
    month: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value || null);
      },
    },
  },
};
</script>
