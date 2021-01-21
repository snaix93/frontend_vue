<template>
  <v-select
    class="tagSelect"
    :class="{ 'v-select--small': dense }"
    :dense="dense"
    v-model="selectedTag"
    :items="tags"
    :disabled="disabled"
    single-line
    clearable
    :label="$t('team.limitByTag.label')"
    :no-data-text="$t('team.limitByTag.noTags')"
  >
    <template #selection="data">
      {{ $t('phrase.limitTo') }}:
      <v-chip
        color="primary"
        text-color="white"
        small
        class="ml-2 pb-0 mb-0"
      >
        {{ data.item }}
      </v-chip>
    </template>
  </v-select>
</template>

<script>
  export default {
    props: {
      value: {},
      tags: {
        type: Array,
        required: true,
      },
      dense: {
        type: Boolean,
        required: false
      },
      disabled: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    computed: {
      selectedTag: {
        get() {
          return this.value;
        },
        set(tag) {
          this.$emit('input', tag);
        },
      },
    },
  };
</script>
