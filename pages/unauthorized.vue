<template>
  <div/>
</template>

<script>
  export default {
    fetch(context) {
      setTimeout(() => {
        context.app.router.push('/auth');
      }, 10);
    },
  };
</script>
