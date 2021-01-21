<template>
  <v-layout
    row
    justify-center
  >
    <PageToolbar>
      <v-toolbar-title>
        {{ $tc('api.name') | capitalize }}
      </v-toolbar-title>
      <v-spacer/>
      <v-flex
        shrink
        class="hidden-xs-only text-xs-right"
      >
        <p class="caption grey--text text--lighten-1 mb-0">
          <a
            href="https://docs.cloudradar.io/api"
            class="grey--text text--lighten-1"
            target="_blank"
          >
            {{ $t('api.learnMoreVisitOurAPIDocumentation') | capitalize }}
          </a>
        </p>
      </v-flex>
      <AppCreateButton
        :label="$t('button.createToken')"
      />
    </PageToolbar>

    <v-flex
      grow>
      <v-card>
        <v-subheader class="grey lighten-3 grey--text text--darken-2">
          <span class="body-2">
            <v-icon small>vpn_key</v-icon>
            {{ $t('api.apiTokens') | capitalize }}
          </span>
          <v-spacer/>
          <span class="caption grey--text text--darken-1">
            {{ $t('api.bearerTokensAreUsed') | capitalize }}
          </span>
        </v-subheader>
        <v-divider/>
        <v-alert
          :value="true"
          type="info"
          class="my-0"
        >
          {{ $t('api.useWithCaution') | capitalize }}
        </v-alert>
        <v-divider/>

        <TokenTable/>

        <TokenDialog
          v-if="tokenDialog"
          @on-create="onCreateToken"
        />

        <TokenDeleteDialog
          v-if="deleteDialog"
          @on-delete="onDeleteToken"
        />
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import AppCreateButton from '@/components/App/AppCreateButton.vue';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import TokenDialog from '@/components/API/TokenDialog';
  import TokenDeleteDialog from '@/components/API/TokenDeleteDialog';
  import TokenTable from '@/components/API/TokenTable';
  import { mapMutations, mapState } from 'vuex';

  export default {
    layout: 'admin',
    components: {
      AppCreateButton,
      PageToolbar,
      TokenDialog,
      TokenDeleteDialog,
      TokenTable,
    },
    middleware: 'canWrite',
    computed: {
      ...mapState('api', [
        'selectedToken',
        'tokenDialog',
        'deleteDialog',
      ]),
      ...mapState('api', {
        tokensCount: 'totalCount'
      }),
    },
    methods: {
      ...mapMutations('api', ['toggleTokenDialog', 'toggleDeleteDialog']),
      onCreateToken({ token, success = true }) {
        if (success) {
          this.toggleTokenDialog(false);
          this.$flash.success(this.$t('message.success.tokenCreate', { name: token.name }));
        } else {
          this.$flash.error(this.$t('message.error.tokenCreate', { name: token.name }));
        }
      },
      onDeleteToken({ token, success = true }) {
        if (success) {
          this.toggleDeleteDialog(false);
          this.$flash.success(this.$t('message.success.tokenDelete', { name: token.name }));
        } else {
          this.$flash.error(this.$t('message.error.tokenDelete', { name: token.name }));
        }
      },
    },
  };
</script>
