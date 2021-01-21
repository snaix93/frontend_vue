<template>
  <v-layout justify-center>
    <PageToolbar>
      <v-toolbar-title>
        {{ $tc('rule.name') | capitalize }}
      </v-toolbar-title>
      <v-spacer/>
      <AppCreateButton :label="$t('button.addRule')"/>
    </PageToolbar>
    <v-flex grow>
      <v-card>
        <RulesTable
          :hosts="hosts"
          @on-update="onUpdate"
          @on-delete="onDelete"
        />
      </v-card>

      <v-flex class="mt-3 caption">
        * {{ $t('rule.heartbeatLink.main') }}
        <nuxt-link to="/settings">{{ $t('rule.heartbeatLink.link') }}</nuxt-link>
      </v-flex>

      <CustomRuleDialog
        v-if="addRuleDialog"
        :hosts="hosts"
        @on-create="onCreate"
        @on-update="onUpdate"
      />
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import CustomRuleDialog from '@/components/Rules/Dialog/CustomRule';
  import AppCreateButton from '@/components/App/AppCreateButton.vue';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar.vue';
  import RulesTable from '@/components/Rules/RulesTable';
  import Host from '@/models/Host';

  export default {
    layout: 'admin',
    middleware: 'canWrite',
    components: {
      CustomRuleDialog,
      AppCreateButton,
      PageToolbar,
      RulesTable,
    },
    data() {
      return {
        hosts: [],
      }
    },
    computed: {
      ...mapState('rules', [
        'addRuleDialog',
      ]),
    },
    async created() {
      this.hosts = await Host.fetchHostSummaryList();
    },
    methods: {
      ...mapMutations('rules', [
        'toggleAddRuleDialog',
      ]),
      onCreate({ success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.ruleAdd'));
          this.toggleAddRuleDialog(false);
        } else {
          this.$flash.error(this.$t('message.error.ruleAdd'));
        }
      },
      onUpdate({ Rule, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.ruleSaved', { rule: Rule.id }));
          this.toggleAddRuleDialog(false);
        } else {
          this.$flash.error(this.$t('message.error.ruleSaved', {
            rule: Rule.id,
          }));
        }
      },
      onDelete({ Rule, success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.ruleDelete', {
            rule: Rule.id,
          }));
        } else {
          this.$flash.error(this.$t('message.error.ruleDelete', {
            rule: Rule.id,
          }));
        }
      },
      checkKeyToLangKey(checkKey) {
        return checkKey
          .split('.')
          .map(s => s.charAt(0).toUpperCase() + s.slice(1))
          .join('');
      },
    },
  };
</script>
