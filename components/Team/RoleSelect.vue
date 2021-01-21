<template>
  <v-select
    class="roleSelect"
    :class="{ 'v-select--small': dense }"
    :dense="dense"
    v-model="model"
    v-validate="rules"
    data-vv-validate-on="blur"
    :label="label"
    :items="roles"
    item-text="label"
    single-line
    :data-vv-name="validationKey"
    :error-messages="errorMessages"
    :disabled="disabled"
    @input="onInput"
  />
</template>

<script>
  export default {
    props: {
      value: {},
      dense: {
        type: Boolean,
        required: false
      },
      disabled: {
        type: Boolean,
        required: false,
        default: false,
      },
      rules: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      label: {
        type: String,
        required: false,
        default: '',
      },
      validationKey: {
        type: String,
        required: false,
        default: '',
      },
      errorMessages: {
        type: String,
        required: false,
        default: '',
      },
    },
    data() {
      return {
        model: this.value,
        roles: [
          {
            label: this.$options.filters.capitalize(this.$t('team.roles.admin')),
            value: 'ROLE_TEAM_ADMIN',
          },
          {
            label: this.$options.filters.capitalize(this.$t('team.roles.member')),
            value: 'ROLE_TEAM_MEMBER',
          },
          {
            label: this.$options.filters.capitalize(this.$t('team.roles.guest')),
            value: 'ROLE_READ_ONLY',
          },
        ],
      };
    },
    methods: {
      onInput() {
        this.$emit('input', this.model);
      },
    },
  };
</script>
