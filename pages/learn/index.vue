<template>
  <v-layout justify-center>
    <PageToolbar>
      <v-toolbar-title>
        {{ $t('learnAndSupport.title') | capitalize }}
      </v-toolbar-title>
      <v-spacer/>
    </PageToolbar>
    <v-flex grow data-cy="learnContent">
      <div class="text-xs-center mt-3 mb-5">
        <div class="headline mb-2">
          {{ $t('learnAndSupport.tutorials') | capitalize }}
        </div>
        <div class="grey--text text--darken-1 mb-3">
          {{ $t('learnAndSupport.startByLearningFromOurVideos') | capitalize }}
        </div>
      </div>

      <HelpVideos/>

      <p class="body-2 text-xs-center mt-5 mb-4">
        {{ $t('learnAndSupport.didntFindWhatYouAreLookingFor') | capitalize }}
      </p>

      <div class="text-xs-center">
        <v-btn
          data-cy="docsButton"
          color="primary"
          href="https://docs.cloudradar.io/"
          target="_blank"
          large
        >
          <v-icon
            class="mr-2"
            left
          >
            local_library
          </v-icon>
          {{ $t('learnAndSupport.readOurKnowledgeBase') }}
        </v-btn>
        <p class="grey--text text--darken-1 my-1">
          {{ $t('phrase.or') }}
        </p>
        <v-btn
          data-cy="openSupportDialog"
          color="primary"
          href="mailto:service@cloudradar.io"
          large
          outline
          @click.prevent="openSupportDialog"
        >
          <v-icon
            class="mr-2"
            left
          >
            chat
          </v-icon>
          {{ $t('learnAndSupport.contactUs') }}
        </v-btn>
      </div>
    </v-flex>
  </v-layout>
</template>
<script>
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import HelpVideos from '@/components/Dashboard/HelpVideos';

  export default {
    layout: 'admin',
    components: {
      PageToolbar,
      HelpVideos,
    },
    methods: {
      openSupportDialog() {
        this.$store.commit('app/showSupportDialog');
      },
    },
  };
</script>
