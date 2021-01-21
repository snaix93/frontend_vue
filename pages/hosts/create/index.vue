<template>
  <v-layout justify-center>
    <PageToolbar>
      <v-toolbar-items>
        <AppBreadcrumbs :items="breadcrumbs"/>
        <v-divider class="mx-4" vertical/>
      </v-toolbar-items>
    </PageToolbar>
    <CreateHostForm/>
  </v-layout>
</template>

<script>
  import CreateHostForm from '@/components/Hosts/CreateHostForm';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import AppBreadcrumbs from '@/components/App/AppBreadcrumbs';
  import hostMixins from '@/mixins/host';

  export default {
    name: 'hostCreate',
    layout: 'admin',
    components: {
      CreateHostForm,
      AppBreadcrumbs,
      PageToolbar,
    },
    mixins: [hostMixins],
    middleware: 'canWrite',
    computed: {
      breadcrumbs() {
        return [
          {
            text: this.$options.filters.capitalize(this.$tc('host.name', 2)),
            disabled: false,
            href: '/hosts',
          },
          {
            text: this.$options.filters.capitalize(this.$t('button.addHost')),
            disabled: true,
            href: '',
          },
        ];
      },
    },
    mounted() {
      if (this.host_countMaxExceeded) {
        this.$router.replace('/hosts');
      }
    },
  };
</script>
