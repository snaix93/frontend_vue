<template>
  <v-layout
    row
    justify-center
  >
    <PageToolbar>
      <v-toolbar-title>
        {{ $tc('subUnit.name') | capitalize }}
        <span class="caption grey--text text--lighten-1">
          ({{ $t('subUnit.description') }})
        </span>
      </v-toolbar-title>
      <v-spacer/>
      <AppCreateButton
        :label="$t('button.addSubUnit')"
      />
    </PageToolbar>
    <v-flex grow>
      <SubUnitsTable
        @on-update="onUpdate"
        @on-delete="onDelete"
      />
      <SubUnitDialog
        v-if="subUnitDialog"
        @on-create="onCreate"
        @on-update="onUpdate"
      />
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';

  import AppCreateButton from '@/components/App/AppCreateButton';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import SubUnitDialog from '@/components/SubUnits/SubUnitDialog';
  import SubUnitsTable from '@/components/SubUnits/SubUnitsTable';

  export default {
    layout: 'admin',
    components: {
      AppCreateButton,
      PageToolbar,
      SubUnitDialog,
      SubUnitsTable,
    },
    middleware: 'canWrite',
    computed: {
      ...mapState('subUnits', ['subUnitDialog']),
    },
    methods: {
      ...mapMutations('subUnits', ['toggleSubUnitDialog']),
      onCreate({ SubUnit, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.subUnitAdd', {
            subUnit: SubUnit.shortId,
          }));
          this.toggleSubUnitDialog();
        } else {
          this.$flash.error(this.$t('message.error.subUnitAdd', {
            subUnit: SubUnit.shortId,
          }));
        }
      },
      onUpdate({ SubUnit, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.subUnitSaved', {
            subUnit: SubUnit.shortId,
          }));
          this.toggleSubUnitDialog();
        } else {
          this.$flash.error(this.$t('message.error.subUnitSaved', {
            subUnit: SubUnit.shortId,
          }));
        }
      },
      onDelete({ SubUnit, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.subUnitDelete', {
            subUnit: SubUnit.shortId,
          }));
        } else {
          this.$flash.error(this.$t('message.error.subUnitDelete', {
            subUnit: SubUnit.shortId,
          }));
        }
      },
    },
  };
</script>
