<template>
  <SubGuide
    :disabled="!answer"
    :step.sync="step"
    @on-cancel="onCancel"
  >
    <template #questionnaire-title>
      {{ $t('host.guide.server.question') }}
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
      <MiniHostForm
        :exclude="hostFormConfig"
        :use-agent="true"
        @on-cancel="onHostFormCancel"
      />
    </template>
  </SubGuide>
</template>

<script>
  import SubGuide from '@/components/Hosts/Guide/SubGuides/SubGuide';
  import MiniHostForm from '@/components/Hosts/MiniHostForm';

  export default {
    components: {
      SubGuide,
      MiniHostForm
    },
    data() {
      return {
        answer: null,
        step: 1,
        options: [
          {
            label: this.$t('host.guide.server.insideAnIntranet'),
            value: 'private'
          },
          {
            label: this.$t('host.guide.server.directlyConnected'),
            value: 'public'
          },
          {
            label: this.$t('host.guide.server.iDontKnow'),
            value: 'none'
          }
        ]
      };
    },
    computed: {
      hostFormConfig() {
        const result = ['services'];

        if (
          this.answer === 'private'
          || this.answer === 'none'
        ) result.push('connect');

        return result;
      },
    },
    methods: {
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
