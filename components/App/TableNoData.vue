<template>
  <div class="text-xs-center">
    <v-progress-linear
      v-if="isLoading"
      :height="5"
      :indeterminate="true"
      color="secondary"
    />
    <span v-else>
      <slot>
        {{ $t('message.error.noData') }}
      </slot>
    </span>
  </div>
</template>

<script>
  export default {
    name: 'TableNoData',
    props: {
      isLoading: {
        type: Boolean,
        required: true,
      }
    }
  };
</script>

<style scoped>

</style>
