<template>
  <portal
    :to="to"
    :order="order"
  >
    <v-flex :class="chartColClass + ' mb-3'">
      <slot/>
    </v-flex>
  </portal>
</template>

<script>
  import{ mapState } from 'vuex';

  export default {
    props: {
      to: {
        type: String,
        required: true,
      },
      order: {
        type: Number,
        required: true,
      },
    },
    computed: {
      ...mapState('hosts', ['measurementsPrintView']),
      chartColClass() {
        switch (this.measurementsPrintView) {
          case 'col3':
            return 'xs4';
          case 'col2':
            return 'xs6';
          default:
            return 'xs12';
        }
      },
    },
  };
</script>
