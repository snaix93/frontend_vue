<template>
  <v-layout/>
</template>

<script>
  export default {
    layout: 'admin',
    fetch(context) {
      context.app.router.push('/dashboard');
    },
  };
</script>
