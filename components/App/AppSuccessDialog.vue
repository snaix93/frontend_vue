<template>
  <v-dialog
    v-model="dialog"
    hide-overlay
    persistent
    width="350"
  >
    <v-card>
      <v-card-text class="text-xs-center">
        <SuccessIcon/>
        <slot name="content"/>
        <v-btn
          color="success"
          outline
          @click="onClick"
        >
          <slot name="button"/>
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapState } from 'vuex';
  import SuccessIcon from '@/components/App/SuccessIcon';

  export default {
    components: {
      SuccessIcon,
    },
    computed: {
      ...mapState('app', {
        dialog: 'successDialog'
      })
    },
    methods: {
      onClick() {
        this.$store.commit('app/hideSuccessDialog');
      },
    },
  };
</script>
