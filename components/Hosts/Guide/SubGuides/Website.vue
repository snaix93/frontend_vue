<template>
  <SubGuide
    :disabled="!answer"
    :step.sync="step"
    @on-cancel="onCancel"
  >
    <template #questionnaire-title>
      {{ $t('host.guide.website.question') }}
    </template>
    <template #questionnaire>
      <v-radio-group
        v-model="answer"
        class="ma-0"
        hide-details
      >
        <div
          v-for="(option, i) in options"
          :key="i"
        >
          <v-radio
            :label="option.label"
            :value="option.value"
            class="mb-3"
          />
        </div>
      </v-radio-group>
    </template>
    <template #form>
      <MiniWebHostForm
        v-if="answer === 'status'"
        @on-cancel="onHostFormCancel"
      />
      <MiniHostForm
        v-if="answer === 'uptime'"
        :exclude="hostFormConfig"
        @on-cancel="onHostFormCancel"
      />
    </template>
  </SubGuide>
</template>

<script>
  import { mapMutations } from 'vuex';
  import SubGuide from '@/components/Hosts/Guide/SubGuides/SubGuide';
  import MiniWebHostForm from '@/components/Hosts/MiniWebHostForm';
  import MiniHostForm from '@/components/Hosts/MiniHostForm';

  export default {
    components: {
      MiniWebHostForm,
      MiniHostForm,
      SubGuide
    },
    data() {
      return {
        answer: null,
        step: 1,
        options: [
          {
            label: this.$t('host.guide.website.theStatus'),
            value: 'status'
          },
          {
            label: this.$t('host.guide.website.theUptime'),
            value: 'uptime'
          },
          {
            label: this.$t('host.guide.website.iDontKnow'),
            value: 'none'
          }
        ]
      };
    },
    computed: {
      hostFormConfig() {
        const result = [];

        if (
          this.answer === 'private'
          || this.answer === 'none'
        ) result.push('connect');

        return result;
      },
    },
    watch: {
      step() {
        if (this.answer === 'none') {
          this.openSupportDialog();
        }
      },
    },
    methods: {
      ...mapMutations('app', ['setSupportSubject', 'setSupportBody']),
      ...mapMutations('hosts', ['toggleGuideDialog']),
      openSupportDialog() {
        this.reset();
        this.toggleGuideDialog(false);
        this.setSupportSubject(this.$t('host.guide.website.supportSubject'));
        this.setSupportBody(this.$t('host.guide.website.supportBody'));
        this.$store.commit('app/showSupportDialog');
      },
      onHostFormCancel() {
        this.step--;
      },
      onCancel() {
        this.reset();
        this.$emit('on-cancel');
      },
      reset() {
        this.step = 1;
        this.answer = null;
      }
    }
  };
</script>
