<template>
  <Modal
    :dialog="dialog"
    :on-submit="onSubmit"
    :on-cancel="onCancel"
    max-width="600px"
  >
    <template #title>
      {{ $t('settings.updateMonitoringLocation') | capitalize }}
    </template>

    <v-layout
      row
      wrap
    >
      <v-flex xs12>
        <div
          class="mb-2"
          v-html="$t('settings.changingTheDefaultCheckLocation', { location: defaultCheckLocation })"
        />
        <strong>{{ $t('phrase.doYouWantToProceed') | capitalize }}</strong>
      </v-flex>
    </v-layout>

    <template #button>
      {{ $t('button.confirm') }}
    </template>
  </Modal>
</template>

<script>
  import Modal from '@/components/App/Modal';

  export default {
    components: { Modal },
    props: {
      dialog: {
        type: Boolean,
        default: () => false,
      },
      defaultCheckLocation: {
        type: String,
        required: true,
      }
    },
    methods: {
      onSubmit() {
        this.$emit('on-update');
      },
      onCancel() {
        this.$emit('on-cancel');
      },
    },
  };
</script>
