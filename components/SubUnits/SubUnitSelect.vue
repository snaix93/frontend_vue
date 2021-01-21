<template>
  <v-select
    v-model="subUnit"
    class="subUnitSelect"
    :class="{ 'v-select--small': dense }"
    :dense="dense"
    :label="__label | capitalize"
    :items="subUnits"
    item-value="id"
    item-text="shortId"
    :disabled="disabled"
    clearable
    single-line
    :no-data-text="$t('form.field.noSubUnits')"
  >
    <template #selection="{item}">
      <div class="layout align-baseline ma-0">
        <span class="body-2 d-inline-block mr-2">
          {{ item.shortId }}
        </span>
        <span class="text-truncate caption d-inline-block">
          ({{ item.name }})
        </span>
      </div>
    </template>
    <template #item="{item}">
      <v-layout row align-baseline>
        <div class="layout align-baseline ma-0">
          <span class="body-2 d-inline-block mr-2">
            {{ item.shortId }}
          </span>
          <span class="text-truncate caption d-inline-block">
            ({{ item.name }})
          </span>
        </div>
      </v-layout>
    </template>
  </v-select>
</template>

<script>
  export default {
    props: {
      value: {
        required: true,
      },
      subUnits: {
        type: Array,
        required: true,
      },
      label: {
        type: String,
        required: false,
      },
      dense: {
        type: Boolean,
        required: false,
      },
      disabled: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    computed: {
      __label() {
        return this.label || this.$t('form.field.subUnit');
      },
      subUnit: {
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
