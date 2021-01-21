<template>
  <v-dialog
    max-width="550px"
    persistent
    value="true"
  >
    <v-card>
      <v-card-title class="subheading">
        {{ $t('settings.rules.customHeartbeat.deactivateWarning.title') }}
      </v-card-title>
      <v-card-text class="py-0 my-0">
        <p class="font-weight-bold">
          {{ $t('settings.rules.customHeartbeat.deactivateWarning.content1') }}
        </p>
        <p class="font-italic">
          {{ $t('settings.rules.customHeartbeat.deactivateWarning.content2') }}
        </p>
        <p class="font-weight-bold">
          {{ $t('settings.rules.customHeartbeat.deactivateWarning.content3') }}
        </p>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-btn
          flat
          @click="onCancel"
        >
          {{ $t('settings.rules.customHeartbeat.deactivateWarning.cancelButton') }}
        </v-btn>
        <v-spacer/>
        <v-btn
          color="primary"
          flat
          @click="onConfirm"
        >
          {{ $t('settings.rules.customHeartbeat.deactivateWarning.confirmButton') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    methods: {
      onConfirm() {
        this.$emit('on-confirm');
      },
      onCancel() {
        this.$emit('on-cancel');
      },
    },
  };
</script>
