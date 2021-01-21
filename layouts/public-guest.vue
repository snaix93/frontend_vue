<script>
  import PublicLayout from '@/layouts/public';

  export default {
    extends: PublicLayout,
    middleware: ['guest', ...PublicLayout.middleware],
  };
</script>
