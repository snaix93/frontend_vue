<template>
  <v-dialog
    :value="dialog"
    max-width="960px"
    persistent
    scrollable
  >
    <v-card>
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ $t('host.installAgent') | capitalize }}
        </span>
        <v-spacer/>
        <v-btn
          icon
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider/>
      <v-card-text>
        <InstallInstructions
          v-if="agentSnippets"
          v-model="selected"
          :kb-uri="kbUri"
          :parent-entity="Host.name"
          :snippets="agentSnippets"
          install-entity="cagent"
        />
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <InstallWarning
          v-if="!!selected"
          :location="Host.name"
        />
        <v-spacer/>
        <v-btn
          color="primary"
          flat
          @click="onCancel"
        >
          {{ $t('button.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import InstallInstructions from '@/components/Installation/InstallInstructions';
  import InstallWarning from '@/components/Installation/InstallWarning';

  export default {
    components: {
      InstallInstructions,
      InstallWarning,
    },
    data() {
      return {
        selected: null,
      };
    },
    computed: {
      ...mapState('hosts', ['Host', 'agentInstallSnippets']),
      ...mapState('hosts', {
        dialog: 'agentDialog',
      }),
      agentSnippets() {
        if (! this.Host) return [];
        return this.agentInstallSnippets[this.Host.id] || [];
      },
      kbUri() {
        return 'configuring-hosts/installing-agents';
      },
    },
    async fetch() {
      if (! this.agentInstallSnippets[this.Host.id]) {
        await this.getAgentInstallSnippets({ Host: this.Host });
      }
    },
    methods: {
      ...mapActions('hosts', ['getAgentInstallSnippets']),
      ...mapMutations('hosts', ['toggleAgentDialog']),
      onCancel() {
        this.toggleAgentDialog();
        this.selected = null;
      },
    },
  };
</script>
