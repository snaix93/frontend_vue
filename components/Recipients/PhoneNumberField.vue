<template>
  <vue-tel-input
    v-model="phone"
    :disabled-fetching-country="isDevEnv"
    :preferred-countries="preferredCountries"
    :disabled="disabled"
    :placeholder="placeholder"
    :label="label || false"
    @onInput="onPhoneInput"
  />
</template>

<script>
  import VueTelInput from 'vue-tel-input';
  import 'vue-tel-input/dist/vue-tel-input.css';
  import appMixin from '@/mixins/app';

  export default {
    components: { VueTelInput },
    mixins: [appMixin],
    props: {
      value: {
        type: String,
      },
      disabled: {
        type: Boolean,
      },
      label: {
        required: false,
        type: String,
      },
      placeholder: {
        required: true,
        type: String,
      },
    },
    data() {
      return {
        phone: '',
        preferredCountries: ['DE', 'GB', 'US'],
      };
    },
    created() {
      if (this.value) {
        this.phone = this.value;
      }
    },
    methods: {
      onPhoneInput({ number }) {
        this.$emit('input', number.replace(/\s/g, ''));
      },
    },
  };
</script>

<style lang="stylus">
</style>
