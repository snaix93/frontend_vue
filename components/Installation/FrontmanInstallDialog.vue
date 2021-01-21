<template>
  <v-dialog
    :value="dialog"
    scrollable
    persistent
    max-width="960px"
  >
    <v-card>
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ $t('frontman.installFrontman') | capitalize }}
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
          v-if="snippets"
          v-model="selected"
          :key="Frontman.id"
          :snippets="snippets"
          install-entity="frontman"
          :parent-entity="Frontman.location"
          :dialog="dialog"
          :kb-uri="kbUri"
        />
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <InstallWarning
          v-if="!!selected"
          :location="Frontman.location"
          type="frontman"
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
      ...mapState('frontmen', {
        dialog: 'installDialog',
      }),
      ...mapState('frontmen', ['Frontman', 'installSnippets']),
      snippets() {
        if (!this.Frontman) return [];
        return this.installSnippets[this.Frontman.id] || [];
      },
      kbUri() {
        return 'managing-frontman/installing-a-frontman';
      },
    },
    async fetch() {
      if (!this.installSnippets[this.Frontman.id]) {
        await this.getFrontmanInstallSnippets({ Frontman: this.Frontman });
      }
    },
    methods: {
      ...mapActions('frontmen', ['getFrontmanInstallSnippets']),
      ...mapMutations('frontmen', ['toggleInstallDialog']),
      onCancel() {
        this.toggleInstallDialog();
      },
    },
  };
</script>
