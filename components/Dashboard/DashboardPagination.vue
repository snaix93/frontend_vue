<template>
  <div
    v-if="show"
    class="text-xs-center mt-4"
  >
    <v-pagination
      v-model="page"
      :length="totalPages"
      color="secondary"
      :total-visible="7"
    />
  </div>
</template>

<script>
  export default {
    name: 'DashboardPagination',
    props: {
      value: {
        type: Number,
        required: true,
      },
      totalPages: {
        type: Number,
        required: true,
      }
    },
    computed: {
      show() {
        return this.totalPages > 1;
      },
      page: {
        get() {
          return this.value;
        },
        set(value) {
          this.$emit('input', value);
        }
      }
    },
  };
</script>

<style scoped>

</style>
