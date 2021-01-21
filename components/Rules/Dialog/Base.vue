<template>
  <v-dialog
    :max-width="maxDialogWidth"
    :value="dialog"
    persistent
    scrollable
  >
    <form
      class="v-card white"
      data-cy="ruleForm"
      @submit.prevent="onSubmit"
    >
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline mr-2">
          <slot name="headline"/>
        </span>

        <slot name="headline-tooltip"/>

        <v-spacer/>

        <v-btn
          icon
          :disabled="waiting"
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="py-0 px-4">
        <slot/>
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <v-btn
          flat
          :disabled="waiting"
          @click="onCancel"
        >
          {{ $t('button.cancel') }}
        </v-btn>

        <v-spacer/>

        <slot name="toggle-switch">
          <v-switch
            v-model="Rule.active"
            :disabled="waiting"
            :label="$t('form.field.active') | capitalize"
            class="shrink mt-0 mr-4 pt-0"
            hide-details
            @change="onSwitchToggleChange"
          />
        </slot>

        <slot name="submit-button">
          <v-btn
            color="primary"
            flat
            :loading="waiting"
            type="submit"
          >
            <slot name="submit-button-text"/>
          </v-btn>
        </slot>
      </v-card-actions>
    </form>
  </v-dialog>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    props: {
      dialog: {
        type: Boolean,
        required: true,
      },
      maxDialogWidth: {
        type: String,
        required: false,
        default: '1080px'
      },
    },
    computed: {
      ...mapState('rules', {
        Rule: 'selectedRule',
      }),
      waiting() {
        return this.$wait.is([
          this.$WAIT_FOR.RULE.CREATE,
          this.$WAIT_FOR.RULE.UPDATE,
        ]);
      }
    },
    methods: {
      onSubmit() {
        this.$emit('onSubmit');
      },
      onCancel() {
        this.$emit('onCancel');
      },
      onSwitchToggleChange() {
        this.$emit('on-switch-toggle-change', this.Rule);
      },
    },
  };
</script>
